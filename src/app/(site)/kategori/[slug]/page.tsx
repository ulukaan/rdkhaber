import { permanentRedirect } from "next/navigation";
import { categoryHref, resolveCategorySlug } from "@/lib/category-path";

export default async function LegacyCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  const href = categoryHref(resolveCategorySlug(slug));
  permanentRedirect(page ? `${href}?page=${page}` : href);
}
