import { categoryHref } from "@/lib/category-path";
import { partyLogoUrl } from "@/lib/party-logos";

export type SiteMenuCategory = { name: string; slug: string };

export type SiteMenuLink = { label: string; href: string };

export const EDITORIAL_SLUGS = [
  "gundem",
  "siyaset",
  "ekonomi",
  "spor",
  "saglik",
  "magazin",
  "turkiye",
  "bolge",
] as const;

export const DISTRICT_SLUGS = [
  "duzce",
  "akcakoca",
  "cilimli",
  "cumayeri",
  "golyaka",
  "gumusova",
  "kaynasli",
  "yigilca",
  "beykoy",
  "bolu",
] as const;

export const SERVICE_LINKS: SiteMenuLink[] = [
  { label: "Nöbetçi Eczane", href: "/eczane" },
  { label: "Trafik Haritası", href: "/trafik" },
  { label: "Vefat Edenler", href: "/vefat" },
  { label: "Yayın Akışı", href: "/yayin-akisi" },
  { label: "Burçlar", href: "/burclar" },
  { label: "Video Haberler", href: "/video-haberler" },
  { label: "Foto Galeri", href: "/foto-galeri" },
  { label: "Haber Gönder", href: "/haber-gonder" },
  { label: "İhbar Hattı", href: "/ihbar-hatti" },
];

export const CORPORATE_LINKS: SiteMenuLink[] = [
  { label: "İletişim", href: "/iletisim" },
  { label: "Künye", href: "/sayfa/kunye" },
  { label: "İçerik şikayeti", href: "/sikayet" },
  { label: "Gizlilik", href: "/sayfa/gizlilik" },
  { label: "KVKK", href: "/sayfa/kvkk" },
  { label: "Çerezler", href: "/cerezler" },
  { label: "Kullanım Şartları", href: "/sayfa/kullanim-kosullari" },
];

function isPartyCategory(c: SiteMenuCategory) {
  if (c.slug === "siyaset" || c.slug === "siyasi-partiler") return false;
  return Boolean(partyLogoUrl(c.slug)) || /parti/i.test(c.slug);
}

export function buildSiteMenuSections(categories: SiteMenuCategory[]) {
  const bySlug = new Map(categories.map((c) => [c.slug, c]));

  return {
    news: EDITORIAL_SLUGS.map((s) => bySlug.get(s)).filter(
      (c): c is SiteMenuCategory => Boolean(c),
    ),
    districts: DISTRICT_SLUGS.map((s) => bySlug.get(s)).filter(
      (c): c is SiteMenuCategory => Boolean(c),
    ),
    parties: categories
      .filter(isPartyCategory)
      .sort((a, b) => a.name.localeCompare(b.name, "tr")),
  };
}

export function categoryLink(c: SiteMenuCategory) {
  return { label: c.name, href: categoryHref(c.slug) };
}
