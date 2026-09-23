import { NextRequest, NextResponse } from "next/server";
import { verifyN8nSecret } from "@/lib/security-tokens";
import {
  createAutomationArticle,
  withArticleUrls,
} from "@/lib/automation-api";

/**
 * Geriye uyumlu n8n yayın endpoint'i.
 * Yeni otomasyonlar için tercih: POST /api/automation/haberler
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const secretHeader =
    request.headers.get("x-n8n-secret") || request.headers.get("x-api-key");

  if (!verifyN8nSecret(authHeader) && !verifyN8nSecret(secretHeader)) {
    return NextResponse.json(
      { ok: false, error: "Yetkisiz erişim. Geçersiz veya eksik API Key / Secret Token." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const article = await createAutomationArticle({
      ...body,
      sourceName: body.sourceName ?? "n8n AI Bot",
      status: body.status ?? "PUBLISHED",
    });

    return NextResponse.json({
      ok: true,
      message: "Haber başarıyla yayınlandı.",
      article: withArticleUrls(article),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Yayınlama hatası";
    const status =
      message.includes("zorunlu") ||
      message.includes("bulunamadı") ||
      message.includes("geçersiz")
        ? 400
        : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
