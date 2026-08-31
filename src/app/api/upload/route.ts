import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { assertSameOriginRequest } from "@/lib/request-origin";
import { detectUploadMime, extensionForMime, isImageMime } from "@/lib/upload-safe";
import { optimizeImageBuffer } from "@/lib/image-optimize";

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const isStaff = session.user.role === "ADMIN" || session.user.role === "EDITOR";
  const isMember = session.user.role === "USER";
  if (!isStaff && !isMember) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const origin = await assertSameOriginRequest();
  if (!origin.ok) {
    return NextResponse.json({ error: origin.error }, { status: 403 });
  }

  const ip = clientIp(req.headers);
  const limited = rateLimit(`upload:${session.user.role}:${session.user.id}:${ip}`, {
    limit: isMember ? 12 : 40,
    windowMs: isMember ? 60 * 60_000 : 60_000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Çok fazla yükleme. ${limited.retryAfterSec} sn sonra tekrar deneyin.` },
      { status: 429 },
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
  }
  if (file.size > (isMember ? 2 * 1024 * 1024 : MAX_SIZE)) {
    return NextResponse.json(
      { error: isMember ? "Dosya çok büyük (max 2MB)" : "Dosya çok büyük (max 5MB)" },
      { status: 400 },
    );
  }

  let buffer = Buffer.from(await file.arrayBuffer());
  let mime = detectUploadMime(buffer);
  let ext = mime ? extensionForMime(mime) : null;
  if (mime && isImageMime(mime)) {
    const optimized = await optimizeImageBuffer(buffer);
    buffer = Buffer.from(optimized.buffer);
    mime = optimized.mime;
    ext = optimized.ext;
  }
  if (!mime || !isImageMime(mime) || !ext) {
    return NextResponse.json({ error: "Geçersiz dosya türü" }, { status: 400 });
  }

  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    isMember ? "avatars" : "",
  );
  await mkdir(uploadDir, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(uploadDir, filename), buffer);

  const url = isMember ? `/uploads/avatars/${filename}` : `/uploads/${filename}`;
  if (isStaff) {
    await prisma.media.create({
      data: {
        url,
        filename: file.name.slice(0, 180),
        mimeType: mime,
        size: file.size,
        uploadedById: session.user.id,
      },
    });
  }

  return NextResponse.json({ url });
}
