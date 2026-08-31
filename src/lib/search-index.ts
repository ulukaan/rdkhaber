import { prisma } from "@/lib/prisma";
import { articleSummarySelect } from "@/lib/articles";
import type { ArticleSummary } from "@/types/article";

const MEILI_HOST = () => process.env.MEILISEARCH_HOST?.trim() ?? "";
const MEILI_KEY = () => process.env.MEILISEARCH_API_KEY?.trim() ?? "";

export function meilisearchConfigured() {
  return Boolean(MEILI_HOST() && MEILI_KEY());
}

/** Meilisearch veya Prisma fallback ile haber arama. */
export async function searchArticlesAdvanced(opts: {
  query: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: ArticleSummary[]; total: number }> {
  const q = opts.query.trim();
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(40, Math.max(1, opts.pageSize ?? 12));
  if (!q) return { items: [], total: 0 };

  if (meilisearchConfigured()) {
    try {
      const res = await fetch(`${MEILI_HOST()}/indexes/articles/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MEILI_KEY()}`,
        },
        body: JSON.stringify({ q, limit: pageSize, offset: (page - 1) * pageSize }),
      });
      if (res.ok) {
        const json = (await res.json()) as {
          hits?: Array<{ id: string }>;
          estimatedTotalHits?: number;
        };
        const ids = (json.hits ?? []).map((h) => h.id);
        if (ids.length > 0) {
          const rows = await prisma.article.findMany({
            where: { id: { in: ids }, status: "PUBLISHED" },
            select: articleSummarySelect,
          });
          const order = new Map(ids.map((id, index) => [id, index]));
          rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
          return { items: rows, total: json.estimatedTotalHits ?? rows.length };
        }
      }
    } catch {
      /* fallback */
    }
  }

  const where = {
    status: "PUBLISHED" as const,
    OR: [
      { title: { contains: q } },
      { summary: { contains: q } },
      { content: { contains: q } },
      { tags: { some: { name: { contains: q } } } },
    ],
  };

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: articleSummarySelect,
    }),
    prisma.article.count({ where }),
  ]);

  return { items, total };
}

/** Meilisearch indeksine tek haber ekler/günceller. */
export async function indexArticleInMeilisearch(article: {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  publishedAt: Date | null;
}) {
  if (!meilisearchConfigured()) return;
  try {
    await fetch(`${MEILI_HOST()}/indexes/articles/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MEILI_KEY()}`,
      },
      body: JSON.stringify([
        {
          id: article.id,
          title: article.title,
          slug: article.slug,
          summary: article.summary,
          content: article.content?.slice(0, 5000),
          publishedAt: article.publishedAt?.toISOString(),
        },
      ]),
    });
  } catch {
    /* ignore */
  }
}
