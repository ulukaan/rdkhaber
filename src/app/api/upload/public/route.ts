import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { assertSameOriginRequest } from "@/lib/request-origin";
import {
  detectUploadMime,
  extensionForMime,
  isImageMime,
  isVideoMime,
} from "@/lib/upload-safe";

const IMAGE_MAX = 8 * 1024 * 1024;
const VIDEO_MAX = 40 * 1024 * 1024;

export async function POST(req: Request) {
  const origin = await assertSameOriginRequest();
  if (!origin.ok) {
    return NextResponse.json({ error: origin.error }, { status: 403 });
  }

  const ip = clientIp(req.headers);
  const limited = rateLimit(`upload:public:${ip}`, { limit: 8, windowMs: 60 * 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Yükleme limiti aşıldı. ${limited.retryAfterSec} sn sonra tekrar deneyin.` },
      { status: 429 },
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
  }

  if (file.size > VIDEO_MAX) {
    return NextResponse.json({ error: "Dosya çok büyük" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = detectUploadMime(buffer);
  if (!mime) {
    return NextResponse.json(
      { error: "Yalnızca fotoğraf (JPG, PNG, WEBP, GIF) veya video (MP4, WEBM) yükleyebilirsiniz" },
      { status: 400 },
    );
  }

  const isImage = isImageMime(mime);
  const isVideo = isVideoMime(mime);
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "Desteklenmeyen dosya türü" }, { status: 400 });
  }

  const max = isVideo ? VIDEO_MAX : IMAGE_MAX;
  if (file.size > max) {
    return NextResponse.json(
      { error: isVideo ? "Video çok büyük (en fazla 40 MB)" : "Görsel çok büyük (en fazla 8 MB)" },
      { status: 400 },
    );
  }

  const ext = extensionForMime(mime);
  if (!ext) {
    return NextResponse.json({ error: "Desteklenmeyen dosya türü" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "reader");
  await mkdir(uploadDir, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({
    url: `/uploads/reader/${filename}`,
    mimeType: mime,
    kind: isVideo ? "video" : "image",
  });
}
