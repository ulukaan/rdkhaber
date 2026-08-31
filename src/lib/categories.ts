import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/cache-tags";

export const getCategoriesForNav = unstable_cache(
  () =>
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { name: true, slug: true },
    }),
  ["categories-nav"],
  { revalidate: 300, tags: [CACHE_TAGS.categories] },
);

export const getCategoriesWithChildren = unstable_cache(
  () =>
    prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { children: { select: { slug: true } } },
    }),
  ["categories-tree"],
  { revalidate: 300, tags: [CACHE_TAGS.categories] },
);
