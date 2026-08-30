/** Pure helpers - safe for client components */

export function authorHref(author: { slug?: string | null; id?: string } | null | undefined) {
  if (!author?.slug) return null;
  return `/yazar/${author.slug}`;
}
