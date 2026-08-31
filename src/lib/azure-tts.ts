import { NEWS_RATE, NEWS_STYLEDEGREE, toNewsAnchorSsml } from "@/lib/news-ssml";

const DEFAULT_VOICE = "tr-TR-EmelNeural";
const FALLBACK_VOICE = "tr-TR-AhmetNeural";

export function azureSpeechConfigured() {
  return Boolean(process.env.AZURE_SPEECH_KEY?.trim() && process.env.AZURE_SPEECH_REGION?.trim());
}

function sentences(text: string) {
  return text
    .split(/(?<=[.!?…])\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function splitForAzure(text: string, max = 1800) {
  const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buf = "";
  const pushBuf = () => {
    if (buf) chunks.push(buf);
    buf = "";
  };

  for (const para of paras) {
    const parts = sentences(para.replace(/\s+/g, " "));
    for (const part of parts) {
      const next = buf ? `${buf} ${part}` : part;
      if (next.length > max && buf) {
        pushBuf();
        buf = part;
      } else {
        buf = next;
      }
    }
    if (buf) buf = `${buf}\n\n`;
  }
  pushBuf();
  return chunks.length ? chunks : [text.trim()].filter(Boolean);
}

function azureEndpoint() {
  const custom = process.env.AZURE_SPEECH_ENDPOINT?.trim().replace(/\/$/, "");
  if (custom) return `${custom}/cognitiveservices/v1`;
  const region = process.env.AZURE_SPEECH_REGION!.trim();
  return `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
}

export function azureVoice() {
  return process.env.AZURE_SPEECH_VOICE?.trim() || DEFAULT_VOICE;
}

function azureStyle() {
  const raw = process.env.AZURE_SPEECH_STYLE?.trim();
  if (!raw || raw === "none" || raw === "off") return null;
  return raw;
}

function azureStyledegree() {
  return process.env.AZURE_SPEECH_STYLEDEGREE?.trim() || NEWS_STYLEDEGREE;
}

function azureRate() {
  return process.env.AZURE_SPEECH_RATE?.trim() || NEWS_RATE;
}

async function postSsml(ssml: string) {
  const res = await fetch(azureEndpoint(), {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.AZURE_SPEECH_KEY!.trim(),
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-160kbitrate-mono-mp3",
      "User-Agent": "DuzceRadikal",
    },
    body: ssml,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail.trim() || `Azure TTS ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 64) throw new Error("Azure boş ses döndürdü");
  return buf;
}

async function synthesizeChunk(text: string) {
  const preferred = azureVoice();
  const style = azureStyle();
  const degree = azureStyledegree();
  const rate = azureRate();
  const attempts = [
    { voice: preferred, style },
    { voice: preferred, style: null },
    { voice: FALLBACK_VOICE, style: null },
  ];

  let lastError: unknown;
  const seen = new Set<string>();
  for (const attempt of attempts) {
    const key = `${attempt.voice}:${attempt.style ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      return await postSsml(toNewsAnchorSsml(text, attempt.voice, attempt.style, degree, rate));
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Azure TTS başarısız");
}

export async function synthesizeAzureSpeech(text: string) {
  const chunks = splitForAzure(text);
  const parts: Buffer[] = [];
  for (const chunk of chunks) {
    parts.push(await synthesizeChunk(chunk));
  }
  return Buffer.concat(parts);
}

export const AZURE_VOICE_LABEL = DEFAULT_VOICE;
