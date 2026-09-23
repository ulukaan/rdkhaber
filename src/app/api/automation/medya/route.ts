import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  assertAutomationAuth,
  automationUnauthorized,
  jsonError,
  jsonOk,
  resolveAutomationAuthor,
} from "@/lib/automation-api";
import { saveStaffMedia } from "@/lib/media-upload";
import { writeAuditLog } from "@/lib/audit-log";

export async function GET(request: NextRequest) {
  if (!assertAutomationAuth(request)) return automationUnauthorized();

  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
    const take = Math.min(100, Math.max(1, Number(searchParams.get("limit") || 30) || 30));
    const skip = (page - 1) * take;

    const [total, media] = await Promise.all([
      prisma.media.count(),
      prisma.media.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          url: true,
          filename: true,
          mimeType: true,
          size: true,
          createdAt: true,
        },
      }),
    ]);

    return jsonOk({ page, limit: take, total, media });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Listeleme hatası", 500);
  }
}

export async function POST(request: NextRequest) {
  if (!assertAutomationAuth(request)) return automationUnauthorized();

  try {
    const author = await resolveAutomationAuthor(null);
    const contentType = request.headers.get("content-type") || "";

    // JSON: { url: "https://..." } — uzak görseli indirip kaydet
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const remoteUrl = String(body.url || "").trim();
      if (!remoteUrl || !/^https?:\/\//i.test(remoteUrl)) {
        return jsonError("'url' alanı http(s) ile başlamalıdır.");
      }

      const res = await fetch(remoteUrl, {
        headers: { "User-Agent": "DuzceRadikal-Automation/1.0" },
        signal: AbortSignal.timeout(25_000),
      });
      if (!res.ok) return jsonError(`Uzak görsel indirilemedi (${res.status}).`, 400);

      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length > 12 * 1024 * 1024) {
        return jsonError("Dosya 12MB sınırını aşıyor.", 400);
      }

      const nameFromUrl = remoteUrl.split("/").pop()?.split("?")[0] || "remote-image.jpg";
      const saved = await saveStaffMedia({
        buffer,
        originalName: String(body.filename || nameFromUrl).slice(0, 180),
        uploadedById: author.id,
        subfolder: "automation",
      });

      await writeAuditLog({
        action: "automation.upload_media_url",
        entity: "Media",
        meta: { url: saved.url, source: remoteUrl },
      });

      return jsonOk({ message: "Medya kaydedildi.", media: saved }, 201);
    }

    // multipart/form-data: file alanı
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return jsonError("'file' alanı (multipart) veya JSON { url } gerekli.");
    }
    if (file.size > 12 * 1024 * 1024) {
      return jsonError("Dosya 12MB sınırını aşıyor.", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const saved = await saveStaffMedia({
      buffer,
      originalName: file.name || "upload.jpg",
      uploadedById: author.id,
      subfolder: "automation",
    });

    await writeAuditLog({
      action: "automation.upload_media",
      entity: "Media",
      meta: { url: saved.url, filename: file.name },
    });

    return jsonOk({ message: "Medya yüklendi.", media: saved }, 201);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Yükleme hatası", 500);
  }
}
