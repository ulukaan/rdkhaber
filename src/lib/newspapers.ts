import { cache } from "react";
import { getSettings } from "@/lib/settings";
import { slugify } from "@/lib/slug";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const BASE = "https://www.gazeteler.tv";
const LOCAL_BASE = "https://yerel.gazeteler.tv";
const LOCAL_DUZCE_URL = `${LOCAL_BASE}/index.php?c=82`;
const REVALIDATE = 3600;

export type NewspaperDef = {
  slug: string;
  name: string;
  region?: "local" | "national";
};

/** Varsayılan ulusal gazeteler (yereller her zaman önde). */
export const DEFAULT_NEWSPAPERS: NewspaperDef[] = [
  { slug: "karar", name: "KARAR", region: "national" },
  { slug: "turkiye", name: "TÜRKİYE", region: "national" },
  { slug: "yenisafak", name: "YENİ ŞAFAK", region: "national" },
  { slug: "aydinlik", name: "AYDINLIK", region: "national" },
  { slug: "milat", name: "MİLAT", region: "national" },
  { slug: "aksam", name: "AKŞAM", region: "national" },
];

/** Panel seçici — ulusal + bilinen Düzce yerelleri. */
export const ALL_NEWSPAPERS: NewspaperDef[] = [
  { slug: "duzce-damla", name: "DÜZCE DAMLA", region: "local" },
  { slug: "duzce-manset", name: "DÜZCE MANŞET", region: "local" },
  { slug: "duzce-parantez", name: "DÜZCE PARANTEZ", region: "local" },
  { slug: "duzce-postasi", name: "DÜZCE POSTASI", region: "local" },
  { slug: "duzcenin-sesi", name: "DÜZCENİN SESİ", region: "local" },
  { slug: "gunaydin-duzce", name: "GÜNAYDIN DÜZCE", region: "local" },
  { slug: "akcakoca-sahilin-sesi", name: "AKÇAKOCA SAHİLİN SESİ", region: "local" },
  { slug: "yeni-akcakoca-haber", name: "YENİ AKÇAKOCA HABER", region: "local" },
  { slug: "sozcu", name: "SÖZCÜ", region: "national" },
  { slug: "hurriyet", name: "HÜRRİYET", region: "national" },
  { slug: "milliyet", name: "MİLLİYET", region: "national" },
  { slug: "sabah", name: "SABAH", region: "national" },
  { slug: "posta", name: "POSTA", region: "national" },
  { slug: "cumhuriyet", name: "CUMHURİYET", region: "national" },
  { slug: "karar", name: "KARAR", region: "national" },
  { slug: "turkiye", name: "TÜRKİYE", region: "national" },
  { slug: "yenisafak", name: "YENİ ŞAFAK", region: "national" },
  { slug: "aydinlik", name: "AYDINLIK", region: "national" },
  { slug: "aksam", name: "AKŞAM", region: "national" },
  { slug: "star", name: "STAR", region: "national" },
  { slug: "birgun", name: "BİRGÜN", region: "national" },
  { slug: "yeniakit", name: "YENİ AKİT", region: "national" },
  { slug: "yenicag", name: "YENİÇAĞ", region: "national" },
  { slug: "milat", name: "MİLAT", region: "national" },
  { slug: "turkgun", name: "TÜRKGÜN", region: "national" },
  { slug: "yenibirlik", name: "YENİ BİRLİK", region: "national" },
];

export type NewspaperCover = {
  slug: string;
  name: string;
  imageUrl: string;
  dateLabel: string | null;
  region: "local" | "national";
};

function normalizeImageUrl(src: string, base = BASE) {
  const cleaned = src.replace("gazeteler.tv//", "gazeteler.tv/");
  if (cleaned.startsWith("//")) return `https:${cleaned}`;
  if (cleaned.startsWith("http")) return cleaned;
  return `${base}${cleaned.startsWith("/") ? "" : "/"}${cleaned}`;
}

function shortLocalName(raw: string) {
  return raw
    .replace(/\s*GAZETESİ\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function localSlugFromName(name: string) {
  return slugify(shortLocalName(name)) || `duzce-${Date.now().toString(36)}`;
}

/** Panelden seçilen ulusal slug’lar (Düzce yerelleri her zaman ayrı çekilir). */
export function resolveNationalNewspapers(slugList: string): NewspaperDef[] {
  const slugs = slugList
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const nationals = ALL_NEWSPAPERS.filter((n) => n.region !== "local");
  const bySlug = new Map(nationals.map((n) => [n.slug, n]));
  // Yerel slug’ları yok say — onlar yerel.gazeteler.tv’den gelir
  const nationalSlugs = slugs.filter((slug) => bySlug.has(slug));
  if (nationalSlugs.length === 0) return DEFAULT_NEWSPAPERS;
  return nationalSlugs
    .map((slug) => bySlug.get(slug)!)
    .slice(0, 10);
}

async function fetchNationalCover(paper: NewspaperDef): Promise<NewspaperCover | null> {
  try {
    const pageUrl = `${BASE}/manset.php?gazete=${encodeURIComponent(paper.slug)}`;
    const res = await fetch(pageUrl, {
      headers: { Accept: "text/html", "User-Agent": UA },
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match =
      html.match(/class="img-fluid"[^>]*src="([^"]+)"/i) ||
      html.match(/src="(https?:\/\/www\.gazeteler\.tv\/+img\/manset\/(?!thumb\/)[^"]+)"/i) ||
      html.match(/src="(\/\/www\.gazeteler\.tv\/+img\/manset\/(?!thumb\/)[^"]+)"/i) ||
      html.match(/src="(\/?img\/manset\/(?!thumb\/)[^"]+\.(?:jpg|jpeg|png|webp))"/i);
    if (!match?.[1]) return null;
    // Thumb fallback sayfalarını ele
    if (/\/thumb\//i.test(match[1])) return null;
    const dateLabel =
      html.match(/Gazetesinin Bugünkü İlk Sayfası\s*\(([^)]+)\)/i)?.[1]?.trim() ??
      html.match(/İlk Sayfası\s*\(([^)]+)\)/i)?.[1]?.trim() ??
      null;
    return {
      slug: paper.slug,
      name: paper.name,
      imageUrl: normalizeImageUrl(match[1]),
      dateLabel,
      region: "national",
    };
  } catch {
    return null;
  }
}

/** Düzce yerel manşetleri — yerel.gazeteler.tv */
export async function fetchDuzceLocalCovers(): Promise<NewspaperCover[]> {
  try {
    const res = await fetch(LOCAL_DUZCE_URL, {
      headers: { Accept: "text/html", "User-Agent": UA },
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const blocks = [
      ...html.matchAll(
        /<div id="mansetdiv">\s*<a[^>]+href="(https:\/\/yerel\.gazeteler\.tv\/mansetler\/resimler\/[^"]+\.jpg)"[^>]*>[\s\S]*?<\/a>\s*<br>\s*([^<]+?)\s*<\/div>/gi,
      ),
    ];
    return blocks
      .map((m) => {
        const imageUrl = normalizeImageUrl(m[1]!, LOCAL_BASE);
        const name = shortLocalName(m[2] ?? "");
        if (!name || !imageUrl) return null;
        return {
          slug: localSlugFromName(name),
          name: name.toLocaleUpperCase("tr-TR"),
          imageUrl,
          dateLabel: null,
          region: "local" as const,
        };
      })
      .filter((row): row is NewspaperCover => Boolean(row));
  } catch {
    return [];
  }
}

export const getDailyNewspapers = cache(async (): Promise<NewspaperCover[]> => {
  const settings = await getSettings();
  const nationalsSelected = resolveNationalNewspapers(settings.newspaperSlugs ?? "");

  const [locals, nationals] = await Promise.all([
    fetchDuzceLocalCovers(),
    Promise.all(nationalsSelected.map((paper) => fetchNationalCover(paper))),
  ]);

  const nationalOk = nationals.filter((row): row is NewspaperCover => Boolean(row));
  // Düzce yerelleri her zaman önde
  return [...locals, ...nationalOk].slice(0, 16);
});
