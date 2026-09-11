import { NextRequest, NextResponse } from "next/server";
import { createHaberFromApi } from "@/lib/haber-api";
import { verifyHaberApiSecret } from "@/lib/security-tokens";
import { clientIp, rateLimit } from "@/lib/rate-limit";

function extractSecret(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  return (
    bearer ||
    request.headers.get("x-api-key") ||
    request.headers.get("x-haber-api-secret") ||
    request.headers.get("x-cron-secret")
  );
}

/**
 * POST /api/haberler — dış sistemlerden taslak/yayın haber oluşturma.
 * Auth: Authorization: Bearer <HABER_API_SECRET|CRON_SECRET>
 */
export async function POST(request: NextRequest) {
  const secret = extractSecret(request);
  if (!verifyHaberApiSecret(secret)) {
    return NextResponse.json({ ok: false, error: "Yetkisiz" }, { status: 401 });
  }

  const ip = clientIp(request.headers);
  const limited = await rateLimit(`haber-api:${ip}`, { limit: 60, windowMs: 60 * 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Rate limit", retryAfterSec: limited.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON gövde gerekli" }, { status: 400 });
  }

  const result = await createHaberFromApi(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json(
    {
      ok: true,
      message: "Haber oluşturuldu",
      article: result.article,
    },
    { status: 201 },
  );
}

/** Basit keşif — auth gerektirmez, sadece uç nokta varlığını gösterir. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "POST /api/haberler",
    auth: "Authorization: Bearer <HABER_API_SECRET veya CRON_SECRET>",
    body: {
      baslik: "string",
      spot: "string",
      icerik: "string (düz metin veya HTML)",
      kategori: "string (slug veya ad)",
      etiketler: ["string"],
      durum: "taslak | inceleme | yayinda",
    },
  });
}
