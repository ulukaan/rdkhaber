import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { activeBreakingWhere } from "@/lib/breaking-news";
import { fetchBreakingTickerItems } from "@/lib/breaking-ticker";

function inCategorySlugs(slugs: string[]) {
  return {
    OR: [
      { category: { slug: { in: slugs } } },
      { extraCategories: { some: { category: { slug: { in: slugs } } } } },
    ],
  };
}

export const articleSummarySelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  coverImageUrl: true,
  videoUrl: true,
  isBreaking: true,
  viewCount: true,
  publishedAt: true,
  headlineKicker: true,
  headlineTitle: true,
  headlineSub: true,
  headlineAlign: true,
  headlineImageAlign: true,
  category: { select: { name: true, slug: true, color: true } },
  author: { select: { id: true, name: true, slug: true, avatarUrl: true, role: true } },
  reporterName: true,
  imageFiveHeadline: true,
  imageMainHeadline: true,
} as const;

export function getLatestArticles(take = 12) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take,
    select: articleSummarySelect,
  });
}

export function getFeedArticles(excludeIds: string[], skip = 0, take = 8) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    skip,
    take,
    select: articleSummarySelect,
  });
}

export const articleContinueSelect = {
  ...articleSummarySelect,
  content: true,
  images: {
    orderBy: { order: "asc" as const },
    select: { id: true, imageUrl: true, caption: true },
  },
  tags: { select: { name: true, slug: true } },
} as const;

export type ArticleContinue = Awaited<
  ReturnType<typeof getRandomSpotlightArticles>
>[number];

/** Öne çıkan / manşet / gündemden rastgele devam haberleri (tam içerik) */
export async function getRandomSpotlightArticles(excludeIds: string[], take = 3) {
  const pool = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [{ isFeatured: true }, { inSpotlight: true }, { isBreaking: true }, { inFiveHeadline: true }],
      ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 48,
    select: articleContinueSelect,
  });

  let rows = pool;
  if (rows.length < take) {
    const extra = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        id: {
          notIn: [...excludeIds, ...rows.map((r) => r.id)],
        },
      },
      orderBy: { publishedAt: "desc" },
      take: take * 3,
      select: articleContinueSelect,
    });
    rows = [...rows, ...extra];
  }

  for (let i = rows.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }
  return rows.slice(0, take);
}

export function getFeaturedArticles(take = 5) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    orderBy: { publishedAt: "desc" },
    take,
    select: articleSummarySelect,
  });
}

/** Öne çıkan — `inSpotlight` işaretli haberler. */
export function getSpotlightArticles(take = 6) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", inSpotlight: true },
    orderBy: { publishedAt: "desc" },
    take,
    select: articleSummarySelect,
  });
}

/** Sürmanşet / beşli manşet — `inFiveHeadline` işaretli haberler (en fazla 10). */
export function getSurmansetArticles(take = 10) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", inFiveHeadline: true },
    orderBy: { publishedAt: "desc" },
    take,
    select: articleSummarySelect,
  });
}

function uniqueArticlesById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

/**
 * Kategori manşeti: yalnızca bu kategoride işaretlenenler.
 * Sol = isFeatured (Ana Manşet), sağ = inSpotlight (Öne Çıkan).
 * Liste ayrı kalır; buraya son haberler çekilmez.
 */
export async function getCategoryArchiveManset(
  categorySlug: string,
  extra?: { childSlugs?: string[] },
) {
  const slugs = [categorySlug, ...(extra?.childSlugs ?? [])];
  const inCat = inCategorySlugs(slugs);

  const [featuredCat, spotlightCat] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PUBLISHED", isFeatured: true, ...inCat },
      orderBy: { publishedAt: "desc" },
      take: 10,
      select: articleSummarySelect,
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", inSpotlight: true, ...inCat },
      orderBy: { publishedAt: "desc" },
      take: 6,
      select: articleSummarySelect,
    }),
  ]);

  const slides = uniqueArticlesById(featuredCat).slice(0, 10);
  const slideIds = new Set(slides.map((a) => a.id));
  const side = uniqueArticlesById(spotlightCat)
    .filter((a) => !slideIds.has(a.id))
    .slice(0, 6);

  return { slides, side };
}

export function getBreakingArticles(take = 5) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", ...activeBreakingWhere() },
    orderBy: { publishedAt: "desc" },
    take,
    select: articleSummarySelect,
  });
}

export function getMostReadArticles(take = 5) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { viewCount: "desc" },
    take,
    select: articleSummarySelect,
  });
}

export function getMostReadByCategory(
  categorySlug: string,
  take = 8,
  extra?: { childSlugs?: string[] },
) {
  const slugs = [categorySlug, ...(extra?.childSlugs ?? [])];
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      ...inCategorySlugs(slugs),
    },
    orderBy: { viewCount: "desc" },
    take,
    select: articleSummarySelect,
  });
}

type ArticleSummaryRow = Awaited<ReturnType<typeof getMostReadArticles>>[number];

async function fetchPublishedArticlesByIds(ids: string[]): Promise<ArticleSummaryRow[]> {
  if (ids.length === 0) return [];
  const articles = await prisma.article.findMany({
    where: { id: { in: ids }, status: "PUBLISHED" },
    select: articleSummarySelect,
  });
  const byId = new Map(articles.map((article) => [article.id, article]));
  return ids
    .map((id) => byId.get(id))
    .filter((article): article is ArticleSummaryRow => Boolean(article));
}

/** Son N günde yayınlanan haberler — okunma sayısına göre trend */
export function getTrendingArticles(take = 5, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { gte: since },
    },
    orderBy: { viewCount: "desc" },
    take,
    select: articleSummarySelect,
  });
}

/** Onaylı yorum sayısına göre en çok tartışılan haberler */
export async function getMostCommentedArticles(take = 5) {
  const groups = await prisma.comment.groupBy({
    by: ["articleId"],
    where: {
      approved: true,
      article: { status: "PUBLISHED" },
    },
    _count: { articleId: true },
    orderBy: { _count: { articleId: "desc" } },
    take,
  });
  return fetchPublishedArticlesByIds(groups.map((group) => group.articleId));
}

/** Üyelerin en çok kaydettiği haberler */
export async function getMostBookmarkedArticles(take = 5) {
  const groups = await prisma.articleBookmark.groupBy({
    by: ["articleId"],
    where: { article: { status: "PUBLISHED" } },
    _count: { articleId: true },
    orderBy: { _count: { articleId: "desc" } },
    take,
  });
  return fetchPublishedArticlesByIds(groups.map((group) => group.articleId));
}

export function getVideoArticles(take = 6) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", videoUrl: { not: null } },
    orderBy: { publishedAt: "desc" },
    take,
    select: articleSummarySelect,
  });
}

export function getArticlesByCategory(
  categorySlug: string,
  take = 12,
  skip = 0,
  extra?: { videoOnly?: boolean; childSlugs?: string[]; excludeIds?: string[] },
) {
  const slugs = [categorySlug, ...(extra?.childSlugs ?? [])];
  const excludeIds = extra?.excludeIds?.filter(Boolean) ?? [];
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      ...inCategorySlugs(slugs),
      ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
      ...(extra?.videoOnly
        ? { AND: [{ videoUrl: { not: null } }, { videoUrl: { not: "" } }] }
        : {}),
    },
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    select: articleSummarySelect,
  });
}

export async function getArticleBySlug(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, slug: true, avatarUrl: true, bio: true, role: true } },
      category: { select: { name: true, slug: true, color: true } },
      extraCategories: {
        select: {
          category: { select: { name: true, slug: true, color: true } },
        },
      },
      tags: { select: { name: true, slug: true } },
      images: {
        orderBy: { order: "asc" },
        select: { id: true, imageUrl: true, caption: true },
      },
      corrections: {
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { user: { select: { name: true } } },
      },
      liveUpdates: {
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        include: { user: { select: { name: true } } },
      },
    },
  });
  if (!article || article.status !== "PUBLISHED") return null;
  return article;
}

export function incrementViewCount(id: string) {
  return prisma.article.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
}

export function searchArticles(query: string, take = 20, skip = 0) {
  const q = query.trim();
  if (!q) return Promise.resolve([]);
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: q } },
        { summary: { contains: q } },
        { content: { contains: q } },
        { tags: { some: { name: { contains: q } } } },
      ],
    },
    orderBy: { publishedAt: "desc" },
    skip,
    take,
    select: articleSummarySelect,
  });
}

export function countSearchArticles(query: string) {
  const q = query.trim();
  if (!q) return Promise.resolve(0);
  return prisma.article.count({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: q } },
        { summary: { contains: q } },
        { content: { contains: q } },
        { tags: { some: { name: { contains: q } } } },
      ],
    },
  });
}

export function getAllArticlesForPanel(filter?: "archived" | "featured" | "breaking" | "video") {
  return prisma.article.findMany({
    where:
      filter === "archived"
        ? { status: "ARCHIVED" }
        : filter === "featured"
          ? { isFeatured: true }
          : filter === "breaking"
            ? { isBreaking: true }
            : filter === "video"
              ? { videoUrl: { not: null } }
              : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      viewCount: true,
      coverImageUrl: true,
      categoryId: true,
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
  });
}

export function getArticleForEdit(id: string) {
  return prisma.article.findUnique({
    where: { id },
    include: {
      tags: { select: { name: true } },
      category: { select: { name: true, color: true } },
      extraCategories: { select: { categoryId: true } },
      images: {
        orderBy: { order: "asc" },
        select: { id: true, imageUrl: true, caption: true, order: true },
      },
    },
  });
}

export function getRelatedArticles(categorySlug: string | string[], excludeId: string, take = 4) {
  const slugs = Array.isArray(categorySlug) ? categorySlug : [categorySlug];
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      ...inCategorySlugs(slugs),
      id: { not: excludeId },
    },
    orderBy: { publishedAt: "desc" },
    take,
    select: articleSummarySelect,
  });
}

export function getEditorArticles(take = 5) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      author: { role: { in: ["EDITOR", "ADMIN"] } },
    },
    orderBy: { publishedAt: "desc" },
    take,
    select: articleSummarySelect,
  });
}

/** Ajans / dış köşe — alıntı yazarlar sekmesi */
export function getQuotedAuthorArticles(take = 5) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { sourceName: { not: null } },
        {
          AND: [
            { reporterName: { not: null } },
            { NOT: { author: { role: { in: ["EDITOR", "ADMIN"] } } } },
          ],
        },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take,
    select: articleSummarySelect,
  });
}

export const getBreakingTickerItems = unstable_cache(
  fetchBreakingTickerItems,
  ["breaking-ticker"],
  { revalidate: 5, tags: [CACHE_TAGS.breaking] },
);
