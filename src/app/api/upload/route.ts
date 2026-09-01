import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { assertSameOriginRequest } from "@/lib/request-origin";
import { detectUploadMime, extensionForMime, isImageMime } from "@/lib/upload-safe";
import { optimizeImageBuffer } from "@/lib/image-optimize";
import { saveStaffMedia } from "@/lib/media-upload";

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

  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = detectUploadMime(buffer);
  if (!mime || !isImageMime(mime)) {
    return NextResponse.json({ error: "Geçersiz dosya türü" }, { status: 400 });
  }

  if (isStaff) {
    try {
      const saved = await saveStaffMedia({
        buffer,
        originalName: file.name,
        uploadedById: session.user.id,
      });
      return NextResponse.json({
        url: saved.url,
        duplicate: saved.duplicate,
        size: saved.size,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Yükleme başarısız";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  let avatarBuffer = buffer;
  let avatarExt = extensionForMime(mime);
  try {
    const optimized = await optimizeImageBuffer(buffer);
    avatarBuffer = Buffer.from(optimized.buffer);
    avatarExt = optimized.ext;
  } catch {
    // sharp yoksa orijinal
  }

  const { randomUUID } = await import("crypto");
  const { writeUploadedFile } = await import("@/lib/upload-path");
  const filename = `${randomUUID()}.${avatarExt}`;
  const url = await writeUploadedFile(`avatars/${filename}`, avatarBuffer);
  return NextResponse.json({ url });
}
