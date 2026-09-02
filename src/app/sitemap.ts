import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";
import { getSettings } from "@/lib/settings";
import { categoryHref } from "@/lib/category-path";

function staticSitemapEntries(base: string): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${base}/kategori`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/foto-galeri`, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/video-haberler`, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/yayin-akisi`, changeFrequency: "hourly", priority: 0.5 },
    { url: `${base}/eczane`, changeFrequency: "hourly", priority: 0.55 },
    { url: `${base}/trafik`, changeFrequency: "hourly", priority: 0.55 },
    { url: `${base}/secim`, changeFrequency: "hourly", priority: 0.7 },
    { url: `${base}/burclar`, changeFrequency: "daily", priority: 0.4 },
    { url: `${base}/iletisim`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/haber-gonder`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/ihbar-hatti`, changeFrequency: "monthly", priority: 0.3 },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await getSettings();
  const base = getSiteUrl();

  try {
    const [articles, categories, pages, galleries] = await Promise.all([
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, publishedAt: true, updatedAt: true },
        orderBy: { publishedAt: "desc" },
        take: 5000,
      }),
      prisma.category.findMany({ select: { slug: true } }),
      prisma.page.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.gallery.findMany({ select: { slug: true, createdAt: true } }),
    ]);

    return [
      ...staticSitemapEntries(base),
      ...categories.map((c) => ({
        url: `${base}${categoryHref(c.slug)}`,
        changeFrequency: "hourly" as const,
        priority: 0.8,
      })),
      ...pages.map((p) => ({
        url: `${base}/sayfa/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.4,
      })),
      ...galleries.map((g) => ({
        url: `${base}/foto-galeri/${g.slug}`,
        lastModified: g.createdAt,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
      ...articles.map((a) => ({
        url: `${base}/haber/${a.slug}`,
        lastModified: a.updatedAt ?? a.publishedAt ?? undefined,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return staticSitemapEntries(base);
  }
}
