import { cache } from "react";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const MEBIS_VEFAT_URL = "https://mebis.duzce.bel.tr/vefat-edenler";
const REVALIDATE = 900; // 15 dk

export type ObituaryEntry = {
  fullName: string;
  fatherName?: string;
  motherName?: string;
  burialDate?: string;
  deathDate?: string;
  announcement?: string;
  address?: string;
  cemetery?: string;
};

const LABEL_KEYS: Record<string, keyof ObituaryEntry> = {
  "Baba Adı": "fatherName",
  "Anne Adı": "motherName",
  "Defin Tarihi": "burialDate",
  "Ölüm Tarihi": "deathDate",
  "Cenaze Duyurusu": "announcement",
  "Cenaze Adresi": "address",
};

function decodeHtmlEntities(raw: string) {
  return raw
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function cleanObituaryText(raw: string) {
  return decodeHtmlEntities(raw)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** dd.MM.yyyy → yyyy-MM-dd (Europe/Istanbul günü). */
export function parseTrDate(value: string | undefined | null) {
  const cleaned = value?.trim();
  if (!cleaned) return null;
  const m = cleaned.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  return `${y}-${mo!.padStart(2, "0")}-${d!.padStart(2, "0")}`;
}

export function formatTrDate(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  const [, y, mo, d] = m;
  return `${d}.${mo}.${y}`;
}

export function todayIsoInIstanbul() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
}

/** MEBIS vefat listesi HTML'inden kayıtları çıkarır — kaynak adı UI'da gösterilmez. */
export function parseObituariesFromHtml(html: string): ObituaryEntry[] {
  const chunks = html.split('<div class="vefat-card">').slice(1);
  if (!chunks.length) return [];

  const entries: ObituaryEntry[] = [];

  for (const chunk of chunks) {
    const card = `<div class="vefat-card">${chunk}`;
    const title = card.match(/class="(?:vefat-isim|card-title)">([^<]+)/);
    if (!title) continue;

    const entry: ObituaryEntry = {
      fullName: cleanObituaryText(title[1]!),
    };

    for (const row of card.matchAll(
      /class="info-label">([^<:]+):<\/span>\s*<span(?: class="info-value")?>([^<]+)/g,
    )) {
      const label = cleanObituaryText(row[1]!);
      const key = LABEL_KEYS[label];
      if (!key) continue;
      entry[key] = cleanObituaryText(row[2]!);
    }

    const cemetery = card.match(/class="mezarlik-banner"[\s\S]*?<span>([^<]+)/);
    if (cemetery) {
      entry.cemetery = cleanObituaryText(cemetery[1]!);
    }

    if (entry.fullName) entries.push(entry);
  }

  return entries;
}

export function filterObituariesByBurialDate(entries: ObituaryEntry[], isoDate: string) {
  return entries.filter((entry) => parseTrDate(entry.burialDate) === isoDate);
}

export function buildObituaryMapUrl(address: string) {
  const query = encodeURIComponent(address.trim());
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function buildObituaryDirectionsUrl(address: string) {
  const destination = encodeURIComponent(address.trim());
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

async function fetchObituariesHtml() {
  const res = await fetch(MEBIS_VEFAT_URL, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return "";
  return res.text();
}

/** Güncel vefat listesi — belediye MEBIS sayfasından çekilir. */
export const fetchObituaries = cache(async (): Promise<ObituaryEntry[]> => {
  try {
    const html = await fetchObituariesHtml();
    if (!html) return [];
    return parseObituariesFromHtml(html);
  } catch {
    return [];
  }
});

export async function getObituariesForDate(isoDate?: string | null) {
  const entries = await fetchObituaries();
  const target = isoDate?.trim() || todayIsoInIstanbul();
  const filtered = filterObituariesByBurialDate(entries, target);
  return { entries: filtered, date: target, total: entries.length };
}
