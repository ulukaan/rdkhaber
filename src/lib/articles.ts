import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/cache-tags";

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

export function getBreakingArticles(take = 5) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", isBreaking: true },
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
  extra?: { videoOnly?: boolean; childSlugs?: string[] },
) {
  const slugs = [categorySlug, ...(extra?.childSlugs ?? [])];
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      category: { slug: { in: slugs } },
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
      images: {
        orderBy: { order: "asc" },
        select: { id: true, imageUrl: true, caption: true, order: true },
      },
    },
  });
}

export function getRelatedArticles(categorySlug: string, excludeId: string, take = 4) {
  return prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      category: { slug: categorySlug },
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

export const getBreakingTickerItems = unstable_cache(
  async () => {
    let items = await prisma.article.findMany({
      where: { status: "PUBLISHED", isBreaking: true },
      orderBy: { publishedAt: "desc" },
      take: 10,
      select: { title: true, slug: true },
    });

    if (items.length === 0) {
      items = await prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 8,
        select: { title: true, slug: true },
      });
    }

    return items;
  },
  ["breaking-ticker"],
  { revalidate: 30, tags: [CACHE_TAGS.breaking] },
);
