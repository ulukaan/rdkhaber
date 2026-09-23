import { NextRequest } from "next/server";
import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  assertAutomationAuth,
  automationUnauthorized,
  jsonError,
  jsonOk,
} from "@/lib/automation-api";

export async function GET(request: NextRequest) {
  if (!assertAutomationAuth(request)) return automationUnauthorized();

  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      published,
      draft,
      review,
      pendingComments,
      mediaCount,
      categories,
      publishedLast24h,
      recentArticles,
    ] = await Promise.all([
      prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      prisma.article.count({ where: { status: ArticleStatus.DRAFT } }),
      prisma.article.count({ where: { status: ArticleStatus.REVIEW } }),
      prisma.comment.count({ where: { approved: false } }),
      prisma.media.count(),
      prisma.category.count(),
      prisma.article.count({
        where: { status: ArticleStatus.PUBLISHED, publishedAt: { gte: since } },
      }),
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        orderBy: { publishedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          publishedAt: true,
          viewCount: true,
          category: { select: { name: true, slug: true } },
        },
      }),
    ]);

    return jsonOk({
      summary: {
        articles: { published, draft, review, publishedLast24h },
        pendingComments,
        mediaCount,
        categories,
      },
      recentArticles,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Özet hatası", 500);
  }
}
