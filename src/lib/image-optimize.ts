import sharp from "sharp";
import { detectUploadMime, extensionForMime } from "@/lib/upload-safe";

const MAX_WIDTH = 1920;

/** Upload edilen görselleri boyutlandırır ve sıkıştırır. */
export async function optimizeImageBuffer(buffer: Buffer) {
  const mime = detectUploadMime(buffer);
  if (!mime?.startsWith("image/")) {
    return { buffer, mime, ext: extensionForMime(mime ?? "") };
  }

  let pipeline = sharp(buffer, { failOn: "none" }).rotate();
  const meta = await pipeline.metadata();
  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, undefined, { withoutEnlargement: true });
  }

  if (mime === "image/png") {
    const out = await pipeline.png({ compressionLevel: 9 }).toBuffer();
    return { buffer: out, mime: "image/png", ext: "png" };
  }
  if (mime === "image/webp") {
    const out = await pipeline.webp({ quality: 82 }).toBuffer();
    return { buffer: out, mime: "image/webp", ext: "webp" };
  }
  if (mime === "image/gif") {
    return { buffer, mime: "image/gif", ext: "gif" };
  }

  const out = await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return { buffer: out, mime: "image/jpeg", ext: "jpg" };
}
