import { createHash } from "crypto";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { optimizeImageBuffer } from "@/lib/image-optimize";
import { detectUploadMime, extensionForMime, isImageMime } from "@/lib/upload-safe";
import { readUploadedFile, writeUploadedFile } from "@/lib/upload-path";

export function hashMediaBuffer(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

type SaveMediaInput = {
  buffer: Buffer;
  originalName: string;
  uploadedById: string;
  subfolder?: string;
};

/** Optimize edilmiş görseli kaydeder; aynı içerik varsa mevcut kaydı döner. */
export async function saveStaffMedia({ buffer, originalName, uploadedById, subfolder }: SaveMediaInput) {
  let mime = detectUploadMime(buffer);
  let ext = mime ? extensionForMime(mime) : null;
  if (!mime || !isImageMime(mime) || !ext) {
    throw new Error("Geçersiz dosya türü");
  }

  try {
    const optimized = await optimizeImageBuffer(buffer);
    buffer = Buffer.from(optimized.buffer);
    mime = optimized.mime;
    ext = optimized.ext;
  } catch {
    // sharp yoksa orijinal dosyayı kaydet
  }

  const contentHash = hashMediaBuffer(buffer);
  const mimeType = mime ?? "image/webp";
  const existing = await prisma.media.findFirst({
    where: { contentHash },
    orderBy: { createdAt: "asc" },
  });
  if (existing) {
    const onDisk = await readUploadedFile(existing.url);
    if (onDisk) {
      return { url: existing.url, duplicate: true, size: existing.size };
    }
  }

  const filename = `${randomUUID()}.${ext}`;
  const relative = subfolder ? `${subfolder}/${filename}` : filename;
  const url = await writeUploadedFile(relative, buffer);

  await prisma.media.create({
    data: {
      url,
      filename: originalName.slice(0, 180),
      mimeType: mimeType,
      size: buffer.length,
      contentHash,
      uploadedById,
    },
  });

  return { url, duplicate: false, size: buffer.length };
}
