import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { getSettings } from "@/lib/settings";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const [settings, articles] = await Promise.all([
    getSettings(),
    prisma.article.findMany({
      where: { status: "PUBLISHED", publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      take: 100,
      select: {
        title: true,
        slug: true,
        summary: true,
        publishedAt: true,
        updatedAt: true,
        author: { select: { name: true } },
      },
    }),
  ]);

  const siteUrl = getSiteUrl();
  const items = articles
    .map((article) => {
      const link = `${siteUrl}/haber/${article.slug}`;
      const pubDate = (article.publishedAt ?? article.updatedAt).toUTCString();
      return `<item>
  <title>${escapeXml(article.title)}</title>
  <link>${escapeXml(link)}</link>
  <guid isPermaLink="true">${escapeXml(link)}</guid>
  <pubDate>${pubDate}</pubDate>
  <description>${escapeXml(article.summary.replace(/<[^>]+>/g, " ").slice(0, 500))}</description>
  <author>${escapeXml(article.author.name)}</author>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(settings.siteName)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(settings.siteSlogan)}</description>
    <language>tr-TR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${siteUrl}/feed.xml`)}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
    },
  });
}
