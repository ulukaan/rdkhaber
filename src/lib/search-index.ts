import { prisma } from "@/lib/prisma";
import { articleSummarySelect } from "@/lib/articles";
import type { ArticleSummary } from "@/types/article";
import { searchQueryVariants } from "@/lib/turkish-fold";

const MEILI_HOST = () =>
  process.env.MEILISEARCH_HOST?.trim() || process.env.MEILI_HOST?.trim() || "";
const MEILI_KEY = () =>
  process.env.MEILISEARCH_API_KEY?.trim() || process.env.MEILI_API_KEY?.trim() || "";

export function meilisearchConfigured() {
  return Boolean(MEILI_HOST() && MEILI_KEY());
}

async function ensureMeiliIndex() {
  if (!meilisearchConfigured()) return;
  try {
    await fetch(`${MEILI_HOST()}/indexes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MEILI_KEY()}`,
      },
      body: JSON.stringify({ uid: "articles", primaryKey: "id" }),
    });
    await fetch(`${MEILI_HOST()}/indexes/articles/settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MEILI_KEY()}`,
      },
      body: JSON.stringify({
        searchableAttributes: ["title", "summary", "content", "tags"],
        rankingRules: ["words", "typo", "proximity", "attribute", "sort", "exactness"],
        typoTolerance: { enabled: true, minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 } },
      }),
    });
  } catch {
    /* ignore */
  }
}

function prismaSearchWhere(variants: string[]) {
  return {
    status: "PUBLISHED" as const,
    OR: variants.flatMap((v) => [
      { title: { contains: v } },
      { summary: { contains: v } },
      { content: { contains: v } },
      { tags: { some: { name: { contains: v } } } },
    ]),
  };
}

/** Meilisearch veya Türkçe-katlamalı Prisma fallback ile haber arama. */
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
      await ensureMeiliIndex();
      const res = await fetch(`${MEILI_HOST()}/indexes/articles/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MEILI_KEY()}`,
        },
        body: JSON.stringify({
          q,
          limit: pageSize,
          offset: (page - 1) * pageSize,
          attributesToSearchOn: ["title", "summary", "content", "tags"],
        }),
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
      /* Prisma'ya düş */
    }
  }

  const variants = searchQueryVariants(q).slice(0, 4);
  const where = prismaSearchWhere(variants);

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
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
  tags?: string[];
}) {
  if (!meilisearchConfigured()) return;
  try {
    await ensureMeiliIndex();
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
          tags: article.tags ?? [],
          publishedAt: article.publishedAt?.toISOString(),
        },
      ]),
    });
  } catch {
    /* ignore */
  }
}

export async function removeArticleFromMeilisearch(articleId: string) {
  if (!meilisearchConfigured()) return;
  try {
    await fetch(`${MEILI_HOST()}/indexes/articles/documents/${articleId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${MEILI_KEY()}` },
    });
  } catch {
    /* ignore */
  }
}
