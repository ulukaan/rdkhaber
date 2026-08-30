import { NextRequest, NextResponse } from "next/server";
import { getRandomSpotlightArticles, getRelatedArticles } from "@/lib/articles";
import { sanitizeArticleHtml } from "@/lib/article-html";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const take = Math.min(3, Math.max(1, Number(searchParams.get("take") ?? "1") || 1));
  const exclude = (searchParams.get("exclude") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const rows = await getRandomSpotlightArticles(exclude, take);
  const items = await Promise.all(
    rows.map(async (a) => {
      const related = await getRelatedArticles(a.category.slug, a.id, 5);
      return {
        ...a,
        content: sanitizeArticleHtml(a.content),
        publishedAt: a.publishedAt?.toISOString() ?? null,
        related: related.map((r) => ({
          ...r,
          publishedAt: r.publishedAt?.toISOString() ?? null,
        })),
      };
    }),
  );

  return NextResponse.json({
    items,
    hasMore: rows.length > 0,
  });
}
