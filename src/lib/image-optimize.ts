import sharp from "sharp";
import { detectUploadMime, extensionForMime } from "@/lib/upload-safe";

const MAX_WIDTH = 1400;
const QUALITY = 78;

/** Upload edilen görselleri boyutlandırır ve sıkıştırır. */
export async function optimizeImageBuffer(buffer: Buffer) {
  const mime = detectUploadMime(buffer);
  if (!mime?.startsWith("image/")) {
    return { buffer, mime, ext: extensionForMime(mime ?? "") };
  }

  if (mime === "image/gif") {
    return { buffer, mime: "image/gif", ext: "gif" };
  }

  let pipeline = sharp(buffer, { failOn: "none" }).rotate();
  const meta = await pipeline.metadata();
  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, undefined, { withoutEnlargement: true });
  }

  const hasAlpha = meta.hasAlpha === true;
  if (mime === "image/png" && hasAlpha) {
    const out = await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer();
    return { buffer: out, mime: "image/png", ext: "png" };
  }

  const out = await pipeline.webp({ quality: QUALITY, effort: 4 }).toBuffer();
  return { buffer: out, mime: "image/webp", ext: "webp" };
}
