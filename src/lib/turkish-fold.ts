/** Türkçe arama için basit katlama — i/İ/ı/I farklarını azaltır. */
export function foldTurkish(input: string) {
  return input
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Prisma `contains` için sorgu varyantları. */
export function searchQueryVariants(raw: string): string[] {
  const q = raw.trim();
  if (!q) return [];
  const folded = foldTurkish(q);
  const asI = folded.replace(/ı/g, "i");
  const asDotless = folded.replace(/i/g, "ı");
  return [...new Set([q, folded, asI, asDotless].filter(Boolean))];
}
