import { NextRequest, NextResponse } from "next/server";
import { trackArticleView } from "@/lib/view-tracking";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

/** POST /api/haberler/goruntuleme — client-side tekil görüntülenme. */
export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);
  const limited = await rateLimit(`view:${ip}`, { limit: 120, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json({ ok: false, error: "rate_limit" }, { status: 429 });
  }

  let body: { articleId?: string };
  try {
    body = (await request.json()) as { articleId?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "json" }, { status: 400 });
  }

  const articleId = body.articleId?.trim();
  if (!articleId) {
    return NextResponse.json({ ok: false, error: "articleId" }, { status: 400 });
  }

  const exists = await prisma.article.findFirst({
    where: { id: articleId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!exists) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const result = await trackArticleView(articleId);
  return NextResponse.json({ ok: true, ...result });
}
