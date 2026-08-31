import { createHash, randomUUID } from "crypto";
import { spawn } from "child_process";
import { chmod, mkdir, readdir, readFile, rm, stat, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { getUploadRoot } from "@/lib/upload-path";

const PIPER_RELEASE = "2023.11.14-2";
const VOICE_ID = "tr_TR-fahrettin-medium";

const ENGINE_URLS: Record<string, string> = {
  win32:
    `https://github.com/rhasspy/piper/releases/download/${PIPER_RELEASE}/piper_windows_amd64.zip`,
  linux:
    `https://github.com/rhasspy/piper/releases/download/${PIPER_RELEASE}/piper_linux_x86_64.tar.gz`,
};

const VOICE_BASE =
  "https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/tr/tr_TR/fahrettin/medium";

const audioCache = new Map<string, { wav: Buffer; at: number }>();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000;
const CACHE_MAX = 24;

let readyPromise: Promise<PiperPaths> | null = null;

type PiperPaths = {
  bin: string;
  cwd: string;
  model: string;
};

function platformKey() {
  if (process.platform === "win32") return "win32";
  if (process.platform === "linux") return "linux";
  throw new Error("Bu sunucuda Piper TTS desteklenmiyor");
}

async function piperRoot() {
  return path.join(await getUploadRoot(), "piper");
}

async function pathExists(file: string) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function downloadFile(url: string, dest: string) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "DuzceRadikal/1.0 (piper-tts; +https://duzceradikal.com)",
      Accept: "application/octet-stream,*/*",
    },
  });
  if (!res.ok) {
    throw new Error(`Piper indirilemedi (${res.status})`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 64) {
    throw new Error("Piper indirmesi eksik");
  }
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, buf);
}

async function extractArchive(archive: string, dest: string) {
  await mkdir(dest, { recursive: true });
  await new Promise<void>((resolve, reject) => {
    const child = spawn("tar", ["-xf", archive, "-C", dest], {
      windowsHide: true,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error("Piper arşivi açılamadı"));
    });
  });
}

async function findPiperBinary(dir: string): Promise<string | null> {
  const names = process.platform === "win32" ? ["piper.exe"] : ["piper"];
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isFile() && names.includes(entry.name)) return full;
    if (entry.isDirectory() && entry.name !== "espeak-ng-data") {
      const nested = await findPiperBinary(full);
      if (nested) return nested;
    }
  }
  return null;
}

async function ensurePiper(): Promise<PiperPaths> {
  const root = await piperRoot();
  const runtimeDir = path.join(root, "runtime");
  const voiceDir = path.join(root, "voices");
  const model = path.join(voiceDir, `${VOICE_ID}.onnx`);
  const modelJson = `${model}.json`;

  let bin = await findPiperBinary(runtimeDir);
  if (!bin) {
    const key = platformKey();
    const url = ENGINE_URLS[key];
    const archiveName = key === "win32" ? "piper.zip" : "piper.tar.gz";
    const archive = path.join(root, archiveName);
    await downloadFile(url, archive);
    await rm(runtimeDir, { recursive: true, force: true });
    await extractArchive(archive, runtimeDir);
    await rm(archive, { force: true });
    bin = await findPiperBinary(runtimeDir);
  }
  if (!bin) throw new Error("Piper çalıştırıcısı bulunamadı");
  if (process.platform !== "win32") {
    await chmod(bin, 0o755).catch(() => undefined);
  }

  if (!(await pathExists(model))) {
    await downloadFile(`${VOICE_BASE}/${VOICE_ID}.onnx?download=true`, model);
  }
  if (!(await pathExists(modelJson))) {
    await downloadFile(`${VOICE_BASE}/${VOICE_ID}.onnx.json?download=true`, modelJson);
  }

  return { bin, cwd: path.dirname(bin), model };
}

function cacheGet(hash: string) {
  const row = audioCache.get(hash);
  if (!row) return null;
  if (Date.now() - row.at > CACHE_TTL_MS) {
    audioCache.delete(hash);
    return null;
  }
  return row.wav;
}

function cacheSet(hash: string, wav: Buffer) {
  audioCache.set(hash, { wav, at: Date.now() });
  if (audioCache.size <= CACHE_MAX) return;
  const oldest = [...audioCache.entries()].sort((a, b) => a[1].at - b[1].at)[0];
  if (oldest) audioCache.delete(oldest[0]);
}

function runPiper(paths: PiperPaths, text: string, outFile: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(
      paths.bin,
      [
        "--model",
        paths.model,
        "--output_file",
        outFile,
        "--sentence-silence",
        "0.35",
        "--length-scale",
        "1.05",
      ],
      {
        cwd: paths.cwd,
        windowsHide: true,
      },
    );
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("Ses üretimi zaman aşımına uğradı"));
    }, 45_000);
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("exit", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || "Piper ses üretemedi"));
    });
    child.stdin.on("error", () => undefined);
    child.stdin.end(text, "utf8");
  });
}

function splitForPiper(text: string, max = 1800) {
  const parts = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?…])\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let buf = "";
  for (const part of parts) {
    if (!buf) {
      buf = part;
      continue;
    }
    if (`${buf} ${part}`.length > max) {
      chunks.push(buf);
      buf = part;
    } else {
      buf = `${buf} ${part}`;
    }
  }
  if (buf) chunks.push(buf);
  return chunks.length ? chunks : [text.trim()].filter(Boolean);
}

function readWavPcm(wav: Buffer) {
  const dataAt = wav.indexOf(Buffer.from("data"));
  if (dataAt < 0 || dataAt + 8 > wav.length) {
    throw new Error("Geçersiz ses dosyası");
  }
  const size = wav.readUInt32LE(dataAt + 4);
  const start = dataAt + 8;
  return {
    header: wav.subarray(0, start),
    pcm: wav.subarray(start, start + size),
  };
}

function concatWav(files: Buffer[]) {
  if (files.length === 1) return files[0];
  const parts = files.map(readWavPcm);
  const pcm = Buffer.concat(parts.map((p) => p.pcm));
  const header = Buffer.from(parts[0].header);
  header.writeUInt32LE(header.length + pcm.length - 8, 4);
  header.writeUInt32LE(pcm.length, header.length - 4);
  return Buffer.concat([header, pcm]);
}

export async function synthesizePiperSpeech(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) throw new Error("Okunacak metin yok");
  if (cleaned.length > 12_000) throw new Error("Metin çok uzun");

  const hash = createHash("sha256").update(`${VOICE_ID}:${cleaned}`).digest("hex");
  const cached = cacheGet(hash);
  if (cached) return cached;

  if (!readyPromise) {
    readyPromise = ensurePiper().catch((err) => {
      readyPromise = null;
      throw err;
    });
  }
  const paths = await readyPromise;
  const chunks = splitForPiper(cleaned);
  const tmpDir = path.join(os.tmpdir(), `rdk-piper-${randomUUID()}`);
  await mkdir(tmpDir, { recursive: true });

  try {
    const wavs: Buffer[] = [];
    for (const [i, chunk] of chunks.entries()) {
      const outFile = path.join(tmpDir, `${i}.wav`);
      await runPiper(paths, chunk, outFile);
      wavs.push(await readFile(outFile));
    }
    const wav = concatWav(wavs);
    cacheSet(hash, wav);
    return wav;
  } finally {
    await rm(tmpDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

export const PIPER_VOICE_LABEL = "Piper Fahrettin (ücretsiz Türkçe model)";
