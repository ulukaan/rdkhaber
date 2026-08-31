import { prisma } from "@/lib/prisma";

function thirtyDaysAgo(): Date {
  return new Date(Date.now() - 30 * 24 * 60 * 60_000);
}

/** Admin istatistik sayfası verileri (sunucu tarafı). */
export async function loadStatsPageData() {
  const since = thirtyDaysAgo();

  const [
    totalViews,
    publishedCount,
    commentCount,
    activeUsers,
    recentPublished,
    topArticles,
    submissions30,
    tips30,
  ] = await Promise.all([
    prisma.article.aggregate({ _sum: { viewCount: true } }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.comment.count({ where: { approved: true } }),
    prisma.user.count({ where: { active: true } }),
    prisma.article.count({
      where: { status: "PUBLISHED", publishedAt: { gte: since } },
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { viewCount: "desc" },
      take: 10,
      select: { title: true, slug: true, viewCount: true, publishedAt: true },
    }),
    prisma.newsSubmission.count({ where: { createdAt: { gte: since } } }),
    prisma.tip.count({ where: { createdAt: { gte: since } } }),
  ]);

  return {
    totalViews: totalViews._sum.viewCount ?? 0,
    publishedCount,
    commentCount,
    activeUsers,
    recentPublished,
    topArticles,
    submissions30,
    tips30,
  };
}
