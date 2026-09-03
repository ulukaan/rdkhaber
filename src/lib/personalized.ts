import { prisma } from "@/lib/prisma";
import { articleSummarySelect, getMostReadArticles } from "@/lib/articles";

/** Okuma, kayıt ve takip geçmişine göre kişisel haber önerileri. */
export async function getPersonalizedArticles(
  userId: string,
  take = 6,
  excludeIds: string[] = [],
) {
  const [readRows, bookmarkRows, follows] = await Promise.all([
    prisma.articleRead.findMany({
      where: { userId },
      orderBy: { readAt: "desc" },
      take: 20,
      select: { articleId: true },
    }),
    prisma.articleBookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { articleId: true },
    }),
    prisma.authorFollow.findMany({
      where: { followerId: userId },
      select: { authorId: true },
    }),
  ]);

  const historyIds = [
    ...new Set([...readRows.map((r) => r.articleId), ...bookmarkRows.map((r) => r.articleId)]),
  ];

  const historyArticles =
    historyIds.length > 0
      ? await prisma.article.findMany({
          where: { id: { in: historyIds } },
          select: { id: true, categoryId: true, authorId: true },
        })
      : [];

  const categoryIds = new Set(historyArticles.map((a) => a.categoryId));
  const authorIds = new Set([
    ...follows.map((row) => row.authorId),
    ...historyArticles.map((a) => a.authorId),
  ]);

  const exclude = new Set([...excludeIds, ...readRows.map((row) => row.articleId)]);
  const orFilters = [
    ...(authorIds.size > 0 ? [{ authorId: { in: [...authorIds] } }] : []),
    ...(categoryIds.size > 0 ? [{ categoryId: { in: [...categoryIds] } }] : []),
  ];

  if (orFilters.length === 0) {
    const fallback = await getMostReadArticles(take + exclude.size);
    return fallback.filter((article) => !exclude.has(article.id)).slice(0, take);
  }

  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      id: { notIn: [...exclude] },
      OR: orFilters,
    },
    orderBy: { publishedAt: "desc" },
    take,
    select: articleSummarySelect,
  });

  if (articles.length >= take) return articles;

  const fallback = await getMostReadArticles(take);
  const seen = new Set([...exclude, ...articles.map((a) => a.id)]);
  return [
    ...articles,
    ...fallback.filter((article) => !seen.has(article.id)),
  ].slice(0, take);
}
