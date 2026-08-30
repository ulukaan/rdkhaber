import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { assertSameOriginRequest } from "@/lib/request-origin";
import { detectUploadMime, extensionForMime, isImageMime } from "@/lib/upload-safe";

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const origin = await assertSameOriginRequest();
  if (!origin.ok) {
    return NextResponse.json({ error: origin.error }, { status: 403 });
  }

  const ip = clientIp(req.headers);
  const limited = rateLimit(`upload:admin:${session.user.id}:${ip}`, {
    limit: 40,
    windowMs: 60_000,
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
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Dosya çok büyük (max 5MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = detectUploadMime(buffer);
  if (!mime || !isImageMime(mime)) {
    return NextResponse.json({ error: "Geçersiz dosya türü" }, { status: 400 });
  }
  const ext = extensionForMime(mime);
  if (!ext) {
    return NextResponse.json({ error: "Geçersiz dosya türü" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(uploadDir, filename), buffer);

  const url = `/uploads/${filename}`;
  await prisma.media.create({
    data: {
      url,
      filename: file.name.slice(0, 180),
      mimeType: mime,
      size: file.size,
      uploadedById: session.user.id,
    },
  });

  return NextResponse.json({ url });
}
