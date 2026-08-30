import { cache } from "react";

const UA_META = "facebookexternalhit/1.1";
const FETCH_TIMEOUT_MS = 5000;
const REVALIDATE_SECONDS = 3600;

export type InstagramPost = {
  shortcode: string;
  url: string;
  imageUrl: string;
  caption: string;
  username: string;
};

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#xfc;/g, "ü")
    .replace(/&#x2019;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function instagramUsernameFromUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed || trimmed === "#") return null;
  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const segment = parsed.pathname.split("/").filter(Boolean)[0];
    if (!segment || ["p", "reel", "reels", "stories", "explore", "accounts"].includes(segment)) {
      return null;
    }
    return segment.replace(/^@/, "");
  } catch {
    return null;
  }
}

async function fetchHtml(url: string, userAgent: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
      next: {
        revalidate:
          process.env.NODE_ENV === "development" ? 60 : REVALIDATE_SECONDS,
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function parseOgMeta(html: string) {
  const read = (property: string) => {
    const match = html.match(new RegExp(`property="${property}" content="([^"]+)"`, "i"));
    return match?.[1]?.replace(/&amp;/g, "&") ?? null;
  };
  return {
    image: read("og:image"),
    title: read("og:title"),
    description: read("og:description"),
  };
}

function extractCaption(raw: string | null | undefined): string {
  if (!raw) return "";
  const decoded = decodeHtmlEntities(raw);
  const colonMatch = decoded.match(/:\s*"([^"]+)"/);
  if (colonMatch) return colonMatch[1].trim();
  const plainMatch = decoded.match(/:\s*(.+?)\.?\s*$/);
  if (plainMatch) return plainMatch[1].replace(/^"|"$/g, "").trim();
  return decoded.trim();
}

function findLatestShortcode(profileHtml: string): string | null {
  const match = profileHtml.match(/\/p\/([A-Za-z0-9_-]{8,15})/);
  return match?.[1] ?? null;
}

/** Profil gridindeki ilk önizleme = en son paylaşım; kare kırpım içermez. */
function findFirstFeedThumbnail(profileHtml: string): string | null {
  const match =
    profileHtml.match(/https:\\\/\\\/scontent[^"']+/) ??
    profileHtml.match(/https:\/\/scontent[^"'\s]+/);
  if (!match) return null;
  return match[0].replace(/\\u0026/g, "&").replace(/\\\//g, "/");
}

function normalizeInstagramImageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const stp = parsed.searchParams.get("stp");
    if (stp && /c\d+/i.test(stp)) {
      parsed.searchParams.set("stp", "dst-jpg_e35_s640x640_tt6");
    }
    return parsed.toString();
  } catch {
    return url.replace(/stp=[^&]+/, "stp=dst-jpg_e35_s640x640_tt6");
  }
}

function pickImageUrl(
  profileHtml: string,
  ogImage: string | null,
): string | null {
  const profileThumb = findFirstFeedThumbnail(profileHtml);
  if (profileThumb) return profileThumb;
  if (ogImage) return normalizeInstagramImageUrl(ogImage);
  return null;
}

export const getLatestInstagramPost = cache(
  async (profileUrl: string): Promise<InstagramPost | null> => {
    const username = instagramUsernameFromUrl(profileUrl);
    if (!username) return null;

    const profileHtml = await fetchHtml(`https://www.instagram.com/${username}/`, UA_META);
    if (!profileHtml) return null;

    const shortcode = findLatestShortcode(profileHtml);
    if (!shortcode) return null;

    const postUrl = `https://www.instagram.com/p/${shortcode}/`;
    const postHtml = await fetchHtml(postUrl, UA_META);
    if (!postHtml) return null;

    const og = parseOgMeta(postHtml);
    const imageUrl = pickImageUrl(profileHtml, og.image);
    if (!imageUrl) return null;

    const caption = extractCaption(og.description ?? og.title);

    return {
      shortcode,
      url: postUrl,
      imageUrl,
      caption,
      username,
    };
  },
);
