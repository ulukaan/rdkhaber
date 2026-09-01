/** Son dakika haberlerinin sitede görünür kalma süresi (saat). */
export const BREAKING_TTL_HOURS = 24;

export function breakingExpiresAt(publishedAt: Date | null | undefined, from = new Date()) {
  if (!publishedAt) return null;
  return new Date(publishedAt.getTime() + BREAKING_TTL_HOURS * 60 * 60 * 1000);
}

/** Yayında ve süresi dolmamış son dakika haberi mi? */
export function isActiveBreaking(
  article: { isBreaking: boolean; publishedAt: Date | string | null | undefined },
  now = new Date(),
) {
  if (!article.isBreaking || !article.publishedAt) return false;
  const publishedAt =
    article.publishedAt instanceof Date ? article.publishedAt : new Date(article.publishedAt);
  if (Number.isNaN(publishedAt.getTime())) return false;
  const expiresAt = breakingExpiresAt(publishedAt, now);
  return expiresAt !== null && expiresAt.getTime() > now.getTime();
}

/** Prisma `where` — yalnızca aktif son dakika haberleri. */
export function activeBreakingWhere(now = new Date()) {
  const minPublishedAt = new Date(now.getTime() - BREAKING_TTL_HOURS * 60 * 60 * 1000);
  return {
    isBreaking: true,
    publishedAt: { gte: minPublishedAt },
  } as const;
}
