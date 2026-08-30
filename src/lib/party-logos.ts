/** Yargıtay CB SİPARS kaynaklı siyasi parti logoları (`public/partiler`). */
export const PARTY_LOGOS: Record<string, string> = {
  "adalet-ve-kalkinma-partisi": "/partiler/adalet-ve-kalkinma-partisi.png",
  "anahtar-parti": "/partiler/anahtar-parti.png",
  "cumhuriyet-halk-partisi": "/partiler/cumhuriyet-halk-partisi.png",
  "iyi-parti": "/partiler/iyi-parti.jpg",
  "milliyetci-hareket-partisi": "/partiler/milliyetci-hareket-partisi.jpg",
  "saadet-partisi": "/partiler/saadet-partisi.jpg",
  "yeniden-refah-partisi": "/partiler/yeniden-refah-partisi.png",
  "yeni-parti": "/partiler/yeni-parti.png",
  "zafer-partisi": "/partiler/zafer-partisi.png",
};

/** Parti marka renkleri — menü hover / arşiv vurgusu */
export const PARTY_COLORS: Record<string, string> = {
  "adalet-ve-kalkinma-partisi": "#f59e0b",
  "anahtar-parti": "#e11d48",
  "cumhuriyet-halk-partisi": "#dc2626",
  "iyi-parti": "#0284c7",
  "milliyetci-hareket-partisi": "#b91c1c",
  "saadet-partisi": "#15803d",
  "yeniden-refah-partisi": "#a16207",
  "yeni-parti": "#0f766e",
  "zafer-partisi": "#b45309",
};

export function partyLogoUrl(slug: string): string | null {
  return PARTY_LOGOS[slug] ?? null;
}

export function partyColor(slug: string): string | null {
  return PARTY_COLORS[slug] ?? null;
}

export function slugFromHref(href: string): string {
  const path = href.split("?")[0]?.split("#")[0] ?? href;
  const parts = path.replace(/\/+$/, "").split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}
