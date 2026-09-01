import { unlink } from "fs/promises";
import { homedir } from "os";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
};

let cachedRoot: string | null = null;

function candidateRoots() {
  const fromEnv = process.env.UPLOAD_DIR?.trim();
  const roots: string[] = [];
  if (fromEnv) roots.push(path.resolve(fromEnv));
  if (process.env.NODE_ENV === "production") {
    roots.push(path.join(homedir(), "domains", "duzceradikal.com", "rdkhaber-uploads"));
    roots.push(path.join(homedir(), "rdkhaber-uploads"));
    roots.push(path.join(process.cwd(), "..", "..", "..", "rdkhaber-uploads"));
    roots.push(path.join(process.cwd(), "..", "rdkhaber-uploads"));
  }
  roots.push(path.join(process.cwd(), "public", "uploads"));
  return [...new Set(roots)];
}

export async function getUploadRoot() {
  if (cachedRoot) return cachedRoot;
  for (const root of candidateRoots()) {
    try {
      await mkdir(root, { recursive: true });
      cachedRoot = root;
      return root;
    } catch {
      // sonraki adayı dene
    }
  }
  const fallback = path.join(process.cwd(), "public", "uploads");
  await mkdir(fallback, { recursive: true });
  cachedRoot = fallback;
  return fallback;
}

/** Tüm olası yükleme köklerini döndürür (eski dağılmış dosyalar için). */
export async function getAllUploadRoots() {
  const roots: string[] = [];
  const seen = new Set<string>();
  for (const root of candidateRoots()) {
    const abs = path.resolve(root);
    if (seen.has(abs)) continue;
    seen.add(abs);
    try {
      await mkdir(root, { recursive: true });
      roots.push(abs);
    } catch {
      // yoksa atla
    }
  }
  return roots;
}

/** `/uploads/foo/bar.jpg` → `foo/bar.jpg` */
export function relativeFromUploadUrl(urlPath: string) {
  const cleaned = urlPath.replace(/\\/g, "/").replace(/^\/+/, "");
  const withoutPrefix = cleaned.replace(/^uploads\/?/, "");
  const normalized = path.posix.normalize(withoutPrefix);
  if (!normalized || normalized === "." || normalized.startsWith("..")) return null;
  return normalized;
}

export function mimeForUploadPath(rel: string) {
  const ext = path.extname(rel).slice(1).toLowerCase();
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

export async function writeUploadedFile(relativePath: string, buffer: Buffer) {
  const rel = relativeFromUploadUrl(`uploads/${relativePath.replace(/^\/+/, "")}`);
  if (!rel) throw new Error("Geçersiz yükleme yolu");
  const root = await getUploadRoot();
  const dest = path.join(/* turbopackIgnore: true */ root, rel);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(/* turbopackIgnore: true */ dest, buffer);
  return `/uploads/${rel}`;
}

export async function readUploadedFile(urlPath: string) {
  const rel = relativeFromUploadUrl(urlPath);
  if (!rel) return null;
  const roots = await getAllUploadRoots();
  const seen = new Set<string>();
  for (const root of roots) {
    const abs = path.resolve(/* turbopackIgnore: true */ root, rel);
    const rootAbs = path.resolve(/* turbopackIgnore: true */ root);
    if (!abs.startsWith(rootAbs + path.sep) && abs !== rootAbs) continue;
    if (seen.has(abs)) continue;
    seen.add(abs);
    try {
      const buffer = await readFile(/* turbopackIgnore: true */ abs);
      return { buffer, mime: mimeForUploadPath(rel) };
    } catch {
      // diğer kökte dene
    }
  }
  return null;
}

export async function deleteUploadedFile(urlPath: string) {
  const rel = relativeFromUploadUrl(urlPath);
  if (!rel) return false;
  const roots = await getAllUploadRoots();
  const seen = new Set<string>();
  let deleted = false;
  for (const root of roots) {
    const abs = path.resolve(/* turbopackIgnore: true */ root, rel);
    const rootAbs = path.resolve(/* turbopackIgnore: true */ root);
    if (!abs.startsWith(rootAbs + path.sep) && abs !== rootAbs) continue;
    if (seen.has(abs)) continue;
    seen.add(abs);
    try {
      await unlink(/* turbopackIgnore: true */ abs);
      deleted = true;
    } catch {
      // dosya yoksa geç
    }
  }
  return deleted;
}
