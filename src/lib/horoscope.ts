import { cache } from "react";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const REVALIDATE = 21_600; // 6 saat

export const ZODIAC_SIGNS = [
  { slug: "koc", label: "Koç", dates: "21 Mar – 20 Nis", symbol: "♈" },
  { slug: "boga", label: "Boğa", dates: "21 Nis – 20 May", symbol: "♉" },
  { slug: "ikizler", label: "İkizler", dates: "21 May – 21 Haz", symbol: "♊" },
  { slug: "yengec", label: "Yengeç", dates: "22 Haz – 22 Tem", symbol: "♋" },
  { slug: "aslan", label: "Aslan", dates: "23 Tem – 22 Ağu", symbol: "♌" },
  { slug: "basak", label: "Başak", dates: "23 Ağu – 22 Eyl", symbol: "♍" },
  { slug: "terazi", label: "Terazi", dates: "23 Eyl – 22 Eki", symbol: "♎" },
  { slug: "akrep", label: "Akrep", dates: "23 Eki – 21 Kas", symbol: "♏" },
  { slug: "yay", label: "Yay", dates: "22 Kas – 21 Ara", symbol: "♐" },
  { slug: "oglak", label: "Oğlak", dates: "22 Ara – 19 Oca", symbol: "♑" },
  { slug: "kova", label: "Kova", dates: "20 Oca – 18 Şub", symbol: "♒" },
  { slug: "balik", label: "Balık", dates: "19 Şub – 20 Mar", symbol: "♓" },
] as const;

export type ZodiacSlug = (typeof ZODIAC_SIGNS)[number]["slug"];

export type HoroscopeItem = {
  slug: ZodiacSlug;
  label: string;
  dates: string;
  symbol: string;
  yorum: string;
  tarih: string;
};

function todayIso() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
}

function signMeta(slug: ZodiacSlug) {
  return ZODIAC_SIGNS.find((s) => s.slug === slug)!;
}

function cleanText(raw: string) {
  return raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#xA0;/gi, " ")
    .replace(/&#xA;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/Devamını Oku/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sentenceCase(text: string) {
  const t = text.trim();
  if (!t) return t;
  return t.replace(/^(\p{L}+)/u, (word) => {
    if (word !== word.toLocaleUpperCase("tr-TR")) {
      return word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1);
    }
    return word.charAt(0) + word.slice(1).toLocaleLowerCase("tr-TR");
  });
}

/** Kart için kısa özet: 1–2 cümle / ~120 karakter. */
export function shortenHoroscope(text: string, maxLen = 120): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return cleaned;
  const parts = cleaned.split(/(?<=[.!?…])\s+/).filter(Boolean);
  let out = parts[0] ?? cleaned;
  if (out.length < 50 && parts[1]) out = `${out} ${parts[1]}`;
  if (out.length <= maxLen) return out;
  const clipped = out.slice(0, maxLen - 1).replace(/\s+\S*$/, "").trim();
  return `${clipped || out.slice(0, maxLen - 1)}…`;
}

function toItem(slug: ZodiacSlug, yorum: string, tarih = todayIso()): HoroscopeItem {
  const meta = signMeta(slug);
  return {
    slug,
    label: meta.label,
    dates: meta.dates,
    symbol: meta.symbol,
    yorum: shortenHoroscope(sentenceCase(yorum)),
    tarih,
  };
}

async function fetchHtml(url: string) {
  const res = await fetch(url, {
    headers: { Accept: "text/html", "User-Agent": UA },
    next: { revalidate: REVALIDATE },
    signal: AbortSignal.timeout(4_000),
  });
  if (!res.ok) return null;
  return res.text();
}

/** Birincil kaynak: günlük burç sayfaları */
async function fetchPrimaryDaily(slug: ZodiacSlug): Promise<HoroscopeItem | null> {
  try {
    const html = await fetchHtml(
      `https://www.sabah.com.tr/astroloji/${slug}-burcu-gunluk-yorum`,
    );
    if (!html) return null;
    const match = html.match(/class="yorumMain"[\s\S]*?<p>([\s\S]*?)<\/p>/i);
    const yorum = cleanText(match?.[1] ?? "");
    if (yorum.length < 40) return null;
    return toItem(slug, yorum);
  } catch {
    return null;
  }
}

const ROUNDUP_ORDER: ZodiacSlug[] = [
  "koc",
  "boga",
  "ikizler",
  "yengec",
  "aslan",
  "basak",
  "terazi",
  "akrep",
  "yay",
  "oglak",
  "kova",
  "balik",
];

function composeRoundupBlock(block: string) {
  const text = cleanText(block);
  const is =
    text.match(/(?:Bugün\s*)?İş:\s*([^]+?)(?=Kariyer:|Para:|Sağlık:|Aşk:|İlişkiler:|$)/i)?.[1] ??
    "";
  const ask =
    text.match(/Aşk:\s*([^]+?)(?=İlişkiler:|İş:|Kariyer:|Para:|Sağlık:|$)/i)?.[1] ?? "";
  const merged = [cleanText(is), cleanText(ask)].filter((p) => p.length > 20).join(" ");
  return sentenceCase(merged);
}

/** Yedek: günlük özet yazısından 12 burç */
async function fetchRoundupFallback(): Promise<HoroscopeItem[]> {
  try {
    const listing = await fetchHtml("https://www.milliyet.com.tr/astroloji/");
    if (!listing) return [];
    const href = [
      ...listing.matchAll(/href="(\/pembenar\/[^"]*gunluk-burc-yorumu[^"]*)"/g),
    ].map((m) => m[1])[0];
    if (!href) return [];

    const html = await fetchHtml(`https://www.milliyet.com.tr${href}`);
    if (!html) return [];

    const content =
      html.match(
        /class="nd-article__content"[^>]*>([\s\S]*?)<\/div>\s*(?:<div class="nd-|<\/article|<aside)/,
      )?.[1] ?? "";
    if (!content) return [];

    const plain = content
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&#xA0;/gi, " ")
      .replace(/&#xA;/gi, "\n")
      .replace(/&amp;/g, "&");

    const nav = plain.search(/KOÇ\s*\n\s*BOĞA/i);
    const body = nav >= 0 ? plain.slice(nav) : plain;
    const chunks = body
      .split(/Devamını Oku/i)
      .map((c) => c.trim())
      .filter((c) => /Bugün/i.test(c) && c.length > 80);

    const tarih = todayIso();
    const items: HoroscopeItem[] = [];
    for (let i = 0; i < ROUNDUP_ORDER.length; i++) {
      const block = chunks[i];
      if (!block) continue;
      const yorum = composeRoundupBlock(block);
      if (yorum.length < 40) continue;
      items.push(toItem(ROUNDUP_ORDER[i], yorum, tarih));
    }
    return items;
  } catch {
    return [];
  }
}

function mergeBySlug(primary: HoroscopeItem[], fill: HoroscopeItem[]) {
  const map = new Map(primary.map((item) => [item.slug, item]));
  for (const item of fill) {
    if (!map.has(item.slug)) map.set(item.slug, item);
  }
  return ZODIAC_SIGNS.map((s) => map.get(s.slug)).filter(
    (item): item is HoroscopeItem => Boolean(item),
  );
}

/**
 * Günlük 12 burç yorumu — kaynak adı UI’da gösterilmez.
 * Önce tek özet sayfası (hızlı), eksikler için bireysel sayfalar.
 */
export const getDailyHoroscopes = cache(async (): Promise<HoroscopeItem[]> => {
  const roundup = await fetchRoundupFallback();
  if (roundup.length >= ZODIAC_SIGNS.length) return roundup;

  const missing = ZODIAC_SIGNS.filter((s) => !roundup.some((r) => r.slug === s.slug));
  const primary = (
    await Promise.all(missing.map((s) => fetchPrimaryDaily(s.slug)))
  ).filter((item): item is HoroscopeItem => Boolean(item));

  return mergeBySlug(roundup, primary);
});
