import { cache } from "react";
import { sanitizeArticleHtml } from "@/lib/article-html";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const BASE_URL = "https://www.duzce.bel.tr";
const LIST_URL = `${BASE_URL}/duyurular`;
const REVALIDATE = 900;

export type MunicipalityAnnouncement = {
  slug: string;
  title: string;
  imageUrl: string | null;
};

export type MunicipalityAnnouncementAttachment = {
  href: string;
  name: string;
  ext: string;
  size: string | null;
};

export type MunicipalityAnnouncementDetail = MunicipalityAnnouncement & {
  publishedLabel: string | null;
  html: string;
  attachments: MunicipalityAnnouncementAttachment[];
};

const UTILITY_KEYWORDS = [
  "su kes",
  "kesinti",
  "elektrik",
  "doğalgaz",
  "dogalgaz",
  "altyapı",
  "altyapi",
  "içme suyu",
  "icme suyu",
];

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

export function cleanAnnouncementText(raw: string) {
  return decodeHtmlEntities(raw)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toAbsoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function absolutizeAnnouncementHtml(html: string) {
  return html
    .replace(/\ssrc="\/([^"]+)"/gi, ` src="${BASE_URL}/$1"`)
    .replace(/\shref="\/([^"]+)"/gi, ` href="${BASE_URL}/$1"`);
}

/** Duyuru listesi HTML parse — kaynak adı UI'da gösterilmez. */
export function parseAnnouncementsListFromHtml(html: string): MunicipalityAnnouncement[] {
  const items: MunicipalityAnnouncement[] = [];
  for (const match of html.matchAll(
    /<a href="(\/duyurular\/[^"]+)" class="ilanlar-list-item">([\s\S]*?)<\/a>/g,
  )) {
    const href = match[1]!;
    const body = match[2]!;
    const slug = href.replace(/^\/duyurular\//, "").trim();
    if (!slug) continue;
    const titleMatch = body.match(/ilanlar-list-item-title">([^<]+)/);
    if (!titleMatch) continue;
    const imageMatch = body.match(/<img src="([^"]+)"/);
    items.push({
      slug,
      title: cleanAnnouncementText(titleMatch[1]!),
      imageUrl: imageMatch ? toAbsoluteUrl(imageMatch[1]!) : null,
    });
  }
  return items;
}

export function parseAnnouncementDetailFromHtml(
  html: string,
  slug: string,
): MunicipalityAnnouncementDetail | null {
  const titleMatch = html.match(/<h1 class="article-title">([^<]+)/);
  if (!titleMatch) return null;

  const metaBlock = html.match(/class="article-meta"[\s\S]*?<\/div>/)?.[0] ?? "";
  const publishedMatch = metaBlock.match(/icon-calendar"><\/i>\s*([^<]+)<\/span>/);
  const bodyMatch = html.match(/class="article-body">([\s\S]*?)<\/div>\s*(?:<div class="article-attachments"|$)/);
  const imageMatch = html.match(/class="article-body"[\s\S]*?<img src="([^"]+)"/);

  const attachments: MunicipalityAnnouncementAttachment[] = [];
  for (const row of html.matchAll(
    /<a href="([^"]+)"[^>]*class="article-attachment-item"[\s\S]*?<span class="article-attachment-ext">([^<]*)<\/span>[\s\S]*?<span class="article-attachment-name">([^<]+)<\/span>(?:[\s\S]*?<span class="article-attachment-size">([^<]*)<\/span>)?/g,
  )) {
    attachments.push({
      href: toAbsoluteUrl(row[1]!),
      ext: cleanAnnouncementText(row[2] ?? ""),
      name: cleanAnnouncementText(row[3]!),
      size: row[4] ? cleanAnnouncementText(row[4]) : null,
    });
  }

  const rawHtml = bodyMatch?.[1]?.trim() ?? "";
  const sanitized = sanitizeArticleHtml(absolutizeAnnouncementHtml(rawHtml));

  return {
    slug,
    title: cleanAnnouncementText(titleMatch[1]!),
    imageUrl: imageMatch ? toAbsoluteUrl(imageMatch[1]!) : null,
    publishedLabel: publishedMatch ? cleanAnnouncementText(publishedMatch[1]!) : null,
    html: sanitized,
    attachments,
  };
}

export function filterAnnouncements(
  items: MunicipalityAnnouncement[],
  query?: string | null,
  utilityOnly = false,
) {
  const q = query?.trim().toLocaleLowerCase("tr-TR");
  return items.filter((item) => {
    const haystack = item.title.toLocaleLowerCase("tr-TR");
    if (utilityOnly && !UTILITY_KEYWORDS.some((word) => haystack.includes(word))) {
      return false;
    }
    if (!q) return true;
    return haystack.includes(q);
  });
}

export function isUtilityOutageAnnouncement(title: string) {
  const haystack = title.toLocaleLowerCase("tr-TR");
  return UTILITY_KEYWORDS.some((word) => haystack.includes(word));
}

async function fetchHtml(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return "";
  return res.text();
}

export const fetchMunicipalityAnnouncements = cache(async (): Promise<MunicipalityAnnouncement[]> => {
  try {
    const html = await fetchHtml(LIST_URL);
    if (!html) return [];
    return parseAnnouncementsListFromHtml(html);
  } catch {
    return [];
  }
});

export const fetchMunicipalityAnnouncement = cache(
  async (slug: string): Promise<MunicipalityAnnouncementDetail | null> => {
    const cleanSlug = slug.trim().replace(/^\/+|\/+$/g, "");
    if (!cleanSlug || !/^[a-z0-9-]+$/i.test(cleanSlug)) return null;
    try {
      const html = await fetchHtml(`${BASE_URL}/duyurular/${encodeURIComponent(cleanSlug)}`);
      if (!html) return null;
      return parseAnnouncementDetailFromHtml(html, cleanSlug);
    } catch {
      return null;
    }
  },
);
