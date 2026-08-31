import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { getSettings } from "@/lib/settings";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const [settings, articles] = await Promise.all([
    getSettings(),
    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) },
      },
      orderBy: { publishedAt: "desc" },
      take: 1000,
      select: { title: true, slug: true, publishedAt: true, updatedAt: true },
    }),
  ]);

  const siteUrl = getSiteUrl();
  const urls = articles
    .map((article) => {
      const loc = `${siteUrl}/haber/${article.slug}`;
      const pub = (article.publishedAt ?? article.updatedAt).toISOString();
      return `<url>
  <loc>${escapeXml(loc)}</loc>
  <news:news>
    <news:publication>
      <news:name>${escapeXml(settings.siteName)}</news:name>
      <news:language>tr</news:language>
    </news:publication>
    <news:publication_date>${pub}</news:publication_date>
    <news:title>${escapeXml(article.title)}</news:title>
  </news:news>
</url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}
