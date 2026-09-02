import { prisma } from "@/lib/prisma";
import { activeBreakingWhere } from "@/lib/breaking-news";

export type BreakingTickerItem = {
  title: string;
  slug: string;
};

/** Önbelleksiz son dakika bandı verisi — API ve canlı yenileme için. */
export async function fetchBreakingTickerItems(): Promise<BreakingTickerItem[]> {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", ...activeBreakingWhere() },
    orderBy: { publishedAt: "desc" },
    take: 10,
    select: { title: true, slug: true },
  });
}
