import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  getArticlesByCategory,
  getCategoryArchiveManset,
  getMostReadByCategory,
} from "@/lib/articles";
import { CategoryArchive } from "@/components/news/CategoryArchive";
import { resolveCategoryArchiveMode, resolveCategorySlug } from "@/lib/category-path";
import { getRates, pickParityItems } from "@/lib/rates";
import { getSettings, parseParityDesign } from "@/lib/settings";

async function loadCategory(slug: string) {
  const resolved = resolveCategorySlug(slug);
  return prisma.category.findUnique({
    where: { slug: resolved },
    include: {
      children: { orderBy: { order: "asc" }, select: { name: true, slug: true } },
      parent: { select: { slug: true, name: true } },
    },
  });
}

function isEconomyCategory(
  category: { slug: string; parent?: { slug: string } | null },
  canonicalSlug: string,
) {
  return (
    canonicalSlug === "ekonomi" ||
    category.slug === "ekonomi" ||
    category.parent?.slug === "ekonomi"
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await loadCategory(slug);
  if (!category) return { title: "Sayfa bulunamadı" };
  return {
    title: category.headingH1 || category.name,
    description: category.description ?? undefined,
  };
}

export default async function RootCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const category = await loadCategory(slug);
  if (!category) notFound();

  const canonicalSlug = resolveCategorySlug(slug);
  const pageSize = category.boxCount || 18;
  const mode = resolveCategoryArchiveMode(category);
  const childSlugs = category.children.map((c) => c.slug);
  const listOpts = {
    videoOnly: mode === "video",
    childSlugs,
  };
  const showFinance = isEconomyCategory(category, canonicalSlug);

  const manset =
    mode === "template"
      ? await getCategoryArchiveManset(canonicalSlug, { childSlugs })
      : { slides: [], side: [] };

  const listSkip = (currentPage - 1) * pageSize;

  const [articles, rates, settings, economyMostRead] = await Promise.all([
    getArticlesByCategory(canonicalSlug, pageSize, listSkip, listOpts),
    showFinance ? getRates() : Promise.resolve(null),
    showFinance ? getSettings() : Promise.resolve(null),
    showFinance
      ? getMostReadByCategory(
          category.parent?.slug === "ekonomi" ? "ekonomi" : canonicalSlug,
          8,
          category.parent?.slug === "ekonomi" ? undefined : { childSlugs },
        )
      : Promise.resolve([]),
  ]);

  const parityItems = rates ? pickParityItems(rates) : [];

  return (
    <CategoryArchive
      category={category}
      headlines={manset.slides}
      mansetSide={manset.side}
      articles={articles}
      currentPage={currentPage}
      mode={mode}
      financeRail={
        showFinance
          ? {
              parityItems,
              marketGroups: rates?.groups ?? [],
              mostRead: economyMostRead,
              parityDesign: settings ? parseParityDesign(settings.parityDesign) : "2",
            }
          : undefined
      }
    />
  );
}
