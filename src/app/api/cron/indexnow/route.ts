import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { submitUrlsToIndexNow } from "@/lib/indexnow";
import { verifyCronSecret } from "@/lib/security-tokens";
import { writeAuditLog } from "@/lib/audit-log";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const secretHeader = request.headers.get("x-cron-secret");
  if (!verifyCronSecret(bearer) && !verifyCronSecret(secretHeader)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const base = getSiteUrl().replace(/\/$/, "");
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
    orderBy: { publishedAt: "desc" },
    take: 500,
  });

  const urls = [
    base,
    `${base}/sitemap.xml`,
    `${base}/news-sitemap.xml`,
    ...articles.map((a) => `${base}/haber/${a.slug}`),
  ];

  const result = await submitUrlsToIndexNow(urls);
  await writeAuditLog({
    action: "cron.indexnow",
    meta: { ...result, urlCount: urls.length },
  });

  return NextResponse.json({ urlCount: urls.length, ...result });
}
