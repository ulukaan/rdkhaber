import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { assertSameOriginRequest } from "@/lib/request-origin";
import {
  detectUploadMime,
  extensionForMime,
  isImageMime,
  isVideoMime,
} from "@/lib/upload-safe";
import { verifyPublicUploadToken } from "@/lib/upload-token";
import { optimizeImageBuffer } from "@/lib/image-optimize";

const IMAGE_MAX_ANON = 2 * 1024 * 1024;
const IMAGE_MAX_AUTH = 5 * 1024 * 1024;
const VIDEO_MAX_AUTH = 20 * 1024 * 1024;

export async function POST(req: Request) {
  const origin = await assertSameOriginRequest();
  if (!origin.ok) {
    return NextResponse.json({ error: origin.error }, { status: 403 });
  }

  const session = await auth();
  const ip = clientIp(req.headers);
  const formData = await req.formData();
  const token = String(formData.get("uploadToken") ?? "");

  if (!verifyPublicUploadToken(token, ip)) {
    return NextResponse.json({ error: "Yükleme oturumu geçersiz veya süresi doldu." }, { status: 403 });
  }

  const limited = rateLimit(
    session?.user ? `upload:public:user:${session.user.id}` : `upload:public:ip:${ip}`,
    {
      limit: session?.user ? 12 : 3,
      windowMs: 60 * 60_000,
    },
  );
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Yükleme limiti aşıldı. ${limited.retryAfterSec} sn sonra tekrar deneyin.` },
      { status: 429 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
  }

  let buffer = Buffer.from(await file.arrayBuffer());
  let mime = detectUploadMime(buffer);
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

  let ext = extensionForMime(mime);
  if (isImage && ext) {
    const optimized = await optimizeImageBuffer(buffer);
    buffer = Buffer.from(optimized.buffer);
    mime = optimized.mime;
    ext = optimized.ext;
  }

  if (isVideo && !session?.user) {
    return NextResponse.json(
      { error: "Video yüklemek için giriş yapmanız gerekir." },
      { status: 403 },
    );
  }

  const max = isVideo ? VIDEO_MAX_AUTH : session?.user ? IMAGE_MAX_AUTH : IMAGE_MAX_ANON;
  if (file.size > max) {
    return NextResponse.json(
      {
        error: isVideo
          ? "Video çok büyük (en fazla 20 MB)"
          : session?.user
            ? "Görsel çok büyük (en fazla 5 MB)"
            : "Görsel çok büyük (en fazla 2 MB)",
      },
      { status: 400 },
    );
  }

  if (!ext) {
    return NextResponse.json({ error: "Desteklenmeyen dosya türü" }, { status: 400 });
  }

  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "reader",
    session?.user ? session.user.id : "anon",
  );
  await mkdir(uploadDir, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(uploadDir, filename), buffer);

  const prefix = session?.user ? `/uploads/reader/${session.user.id}` : "/uploads/reader/anon";
  return NextResponse.json({
    url: `${prefix}/${filename}`,
    mimeType: mime,
    kind: isVideo ? "video" : "image",
  });
}
