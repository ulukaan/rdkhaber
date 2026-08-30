export function categoryHref(slug: string) {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  return `/${clean}`;
}

/** Eski / yanlış menü adresleri → veritabanı slug */
export const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  "bolge-haberleri": "bolge-kategorileri",
  "siyaset-partiler": "siyasi-partiler",
};

export function resolveCategorySlug(slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  return CATEGORY_SLUG_ALIASES[clean] ?? clean;
}

export function resolveCategoryHref(href: string): string {
  const trimmed = normalizeCategoryHref(href.trim());
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return trimmed;
  const slug = trimmed.replace(/^\/+/, "").split("/")[0];
  if (!slug) return trimmed;
  const resolved = resolveCategorySlug(slug);
  if (resolved === slug) return trimmed;
  return trimmed.replace(`/${slug}`, `/${resolved}`);
}

export type CategoryArchiveMode = "template" | "video" | "photo";
export type CategoryPageTemplate = "klasik" | "liste" | "dergi";

export const MANSET_HEADLINE_COUNT = 16; // 10 slider + 6 yan kart
export const MANSET_SLIDE_MAX = 10;
export const MANSET_SIDE_COUNT = 6;

/**
 * Az haberde sağ ızgarayı boş bırakmamak için: önce yan 6’yı doldur,
 * kalanı (en fazla 10) slider’a ver. 16+ haberde klasik 10+6.
 */
export function splitAnaMansetHeadlines<T>(items: T[]): { slides: T[]; side: T[] } {
  if (items.length === 0) return { slides: [], side: [] };

  if (items.length > MANSET_SLIDE_MAX + MANSET_SIDE_COUNT) {
    return {
      slides: items.slice(0, MANSET_SLIDE_MAX),
      side: items.slice(MANSET_SLIDE_MAX, MANSET_SLIDE_MAX + MANSET_SIDE_COUNT),
    };
  }

  const sideCount = Math.min(MANSET_SIDE_COUNT, Math.max(0, items.length - 1));
  return {
    slides: items.slice(0, items.length - sideCount),
    side: items.slice(items.length - sideCount),
  };
}

/** Foto/video özel modları; aksi halde Ana Manşet 10 + şablon. */
export function resolveCategoryArchiveMode(flags: {
  videoGallery: boolean;
  photoGallery: boolean;
  fixedDesign?: boolean;
}): CategoryArchiveMode {
  if (flags.videoGallery && !flags.photoGallery) return "video";
  if (flags.photoGallery && !flags.videoGallery) return "photo";
  return "template";
}

export function resolveCategoryPageTemplate(raw: string | null | undefined): CategoryPageTemplate {
  if (raw === "liste" || raw === "ekonomi") return "liste";
  if (raw === "dergi" || raw === "magazin") return "dergi";
  // klasik | spor | boş | diğer
  return "klasik";
}

export function isCategoryPath(pathname: string, slug: string) {
  const href = categoryHref(slug);
  return (
    pathname === href ||
    pathname === `/kategori/${slug}` ||
    pathname.startsWith(`/kategori/${slug}/`)
  );
}

/** Menüde kalan eski `/kategori/slug` adreslerini kök yola çevirir. */
export function normalizeCategoryHref(href: string) {
  const trimmed = href.trim();
  const match = /^\/kategori\/([^/?#]+)(.*)$/.exec(trimmed);
  if (!match) return trimmed;
  return `/${match[1]}${match[2] ?? ""}`;
}

export function isActiveNavHref(pathname: string, href: string) {
  if (!href || href === "#") return false;
  if (href.startsWith("http")) return false;
  if (href === "/") return pathname === "/";
  const canonical = normalizeCategoryHref(href);
  return (
    pathname === canonical ||
    pathname.startsWith(`${canonical}/`) ||
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}
