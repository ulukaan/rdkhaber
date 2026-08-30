import { categoryHref } from "@/lib/category-path";

export type MobileStripItem = { label: string; href: string };

export function mobileStripFromCategories(
  categories: { name: string; slug: string }[],
): MobileStripItem[] {
  const slugs = ["gundem", "siyaset", "bolge", "spor", "ekonomi", "magazin"];
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter(Boolean)
    .map((c) => ({ label: c!.name, href: categoryHref(c!.slug) }));
}
