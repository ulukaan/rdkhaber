import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getArticlesByCategory } from "@/lib/articles";
import { CategoryArchive } from "@/components/news/CategoryArchive";
import {
  MANSET_HEADLINE_COUNT,
  resolveCategoryArchiveMode,
  resolveCategorySlug,
} from "@/lib/category-path";

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

  const headlines =
    mode === "template"
      ? await getArticlesByCategory(canonicalSlug, MANSET_HEADLINE_COUNT, 0, listOpts)
      : [];

  const listSkip =
    mode === "template"
      ? MANSET_HEADLINE_COUNT + (currentPage - 1) * pageSize
      : (currentPage - 1) * pageSize;

  const articles = await getArticlesByCategory(canonicalSlug, pageSize, listSkip, listOpts);

  return (
    <CategoryArchive
      category={category}
      headlines={headlines}
      articles={articles}
      currentPage={currentPage}
      mode={mode}
    />
  );
}
