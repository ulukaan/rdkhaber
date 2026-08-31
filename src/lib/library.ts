import { prisma } from "@/lib/prisma";
import { articleSummarySelect } from "@/lib/articles";

export async function getLibraryCounts(userId: string) {
  const [bookmarks, reads, following, submissions, comments] = await Promise.all([
    prisma.articleBookmark.count({ where: { userId } }),
    prisma.articleRead.count({ where: { userId } }),
    prisma.authorFollow.count({ where: { followerId: userId } }),
    prisma.newsSubmission.count({ where: { submitterId: userId } }),
    prisma.comment.count({ where: { userId } }),
  ]);
  return { bookmarks, reads, following, submissions, comments };
}

export async function getBookmarkedArticles(userId: string, take = 24) {
  const rows = await prisma.articleBookmark.findMany({
    where: { userId, article: { status: "PUBLISHED" } },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      createdAt: true,
      article: { select: articleSummarySelect },
    },
  });
  return rows.map((row) => ({ savedAt: row.createdAt, article: row.article }));
}

export async function getReadArticles(userId: string, take = 24) {
  const rows = await prisma.articleRead.findMany({
    where: { userId, article: { status: "PUBLISHED" } },
    orderBy: { readAt: "desc" },
    take,
    select: {
      readAt: true,
      article: { select: articleSummarySelect },
    },
  });
  return rows.map((row) => ({ readAt: row.readAt, article: row.article }));
}

export async function getFollowedAuthors(userId: string) {
  const rows = await prisma.authorFollow.findMany({
    where: { followerId: userId, author: { active: true } },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
          avatarUrl: true,
          bio: true,
          role: true,
          _count: { select: { articles: { where: { status: "PUBLISHED" } } } },
        },
      },
    },
  });
  return rows.map((row) => ({ followedAt: row.createdAt, author: row.author }));
}
