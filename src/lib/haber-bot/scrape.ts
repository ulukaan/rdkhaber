import { sanitizeArticleHtml } from "@/lib/article-html";

const SKIP_PATH =
  /\/(kategori|category|tag|etiket|yazar|author|sayfa|page|arama|search|giris|login|uye|rss|feed|sitemap|wp-json|wp-admin|wp-content|wp-login|video|galeri|foto|canli|iletisim|kunye|reklam|yorum|archive|arsiv)(\/|$)/i;

export function decodeEntities(input: string) {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, "&");
}

export function stripTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function decodeText(html: string) {
  return stripTags(decodeEntities(html));
}

export function metaContent(html: string, names: string[]) {
  for (const name of names) {
    const prop = new RegExp(
      `<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i",
    );
    const prop2 = new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["'][^>]*>`,
      "i",
    );
    const match = html.match(prop) ?? html.match(prop2);
    if (match?.[1]) return decodeEntities(match[1].trim());
  }
  return "";
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function textToHtml(text: string) {
  const parts = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return "";
  return parts.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
}

export function absolutizeHtml(html: string, origin: string) {
  return html.replace(
    /(\s(?:src|href)=["'])(\/[^"']*)(["'])/gi,
    (_, pre: string, path: string, post: string) => `${pre}${origin}${path}${post}`,
  );
}

export function cleanContent(html: string, origin: string) {
  const withoutJunk = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  return sanitizeArticleHtml(absolutizeHtml(withoutJunk, origin));
}

function innerByClass(html: string, classOrId: string) {
  const re = new RegExp(
    `<([a-z0-9]+)[^>]*(?:class|id)=["'][^"']*${classOrId}[^"']*["'][^>]*>([\\s\\S]*?)</\\1>`,
    "i",
  );
  const match = html.match(re);
  return match?.[2] ?? "";
}

function parseJsonLdArticles(html: string) {
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const found: Array<{
    headline?: string;
    articleBody?: string;
    description?: string;
    image?: unknown;
    datePublished?: string;
    author?: unknown;
  }> = [];

  for (const block of blocks) {
    try {
      const json = JSON.parse(block[1].replace(/[\u0000-\u001F]+/g, " ")) as unknown;
      const nodes = flattenLd(json);
      for (const node of nodes) {
        const type = String(Array.isArray(node["@type"]) ? node["@type"].join(" ") : node["@type"] ?? "");
        if (/NewsArticle|Article|BlogPosting|ReportageNewsArticle/i.test(type)) {
          found.push(node as (typeof found)[number]);
        }
      }
    } catch {
      continue;
    }
  }
  return found[0] ?? null;
}

function flattenLd(json: unknown): Array<Record<string, unknown>> {
  if (!json) return [];
  if (Array.isArray(json)) return json.flatMap(flattenLd);
  if (typeof json !== "object") return [];
  const obj = json as Record<string, unknown>;
  const graph = obj["@graph"];
  if (Array.isArray(graph)) return graph.flatMap(flattenLd);
  return [obj];
}

function ldImage(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return ldImage(value[0]);
  if (typeof value === "object" && value && "url" in value) {
    return typeof (value as { url: unknown }).url === "string"
      ? ((value as { url: string }).url)
      : null;
  }
  return null;
}

function ldAuthor(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return ldAuthor(value[0]);
  if (typeof value === "object" && value && "name" in value) {
    const name = (value as { name: unknown }).name;
    return typeof name === "string" ? name : null;
  }
  return null;
}

export type ScrapedArticle = {
  title: string;
  url: string;
  summary: string;
  content: string;
  coverUrl: string | null;
  publishedAt: Date | null;
  author: string | null;
};

export function extractArticleFromHtml(html: string, pageUrl: string): ScrapedArticle | null {
  const origin = new URL(pageUrl).origin;
  const ld = parseJsonLdArticles(html);
  const title =
    decodeText(ld?.headline ? String(ld.headline) : "") ||
    metaContent(html, ["og:title", "twitter:title"]) ||
    decodeText(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "") ||
    decodeText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");

  const bodySelectors = [
    "td-post-content",
    "entry-content",
    "haber-icerik",
    "haber-detay",
    "news-content",
    "news-detail",
    "article-content",
    "article-body",
    "post-content",
    "detay-icerik",
    "content-inner",
    "itemFullText",
    "news_content",
  ];

  let rawHtml =
    (typeof ld?.articleBody === "string" && ld.articleBody.includes("<")
      ? ld.articleBody
      : "") || "";
  if (!rawHtml) {
    const articleInner = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? "";
    rawHtml = articleInner;
  }
  for (const sel of bodySelectors) {
    if (decodeText(rawHtml).length > 120) break;
    const chunk = innerByClass(html, sel);
    if (decodeText(chunk).length > decodeText(rawHtml).length) rawHtml = chunk;
  }

  let content = cleanContent(rawHtml, origin);
  if (decodeText(content).length < 80 && typeof ld?.articleBody === "string") {
    content = cleanContent(textToHtml(ld.articleBody), origin);
  }

  const summarySource =
    (typeof ld?.description === "string" ? ld.description : "") ||
    metaContent(html, ["og:description", "description", "twitter:description"]);
  const summaryText = decodeText(summarySource) || decodeText(content);
  const summary =
    summaryText.length > 360 ? `${summaryText.slice(0, 357).trim()}…` : summaryText || "Haber özeti";

  const coverRaw =
    ldImage(ld?.image) ||
    metaContent(html, ["og:image", "twitter:image", "twitter:image:src"]) ||
    rawHtml.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ||
    null;
  let coverUrl: string | null = coverRaw;
  if (coverUrl) {
    try {
      coverUrl = new URL(coverUrl, origin).toString();
    } catch {
      coverUrl = null;
    }
  }

  const dateRaw =
    (typeof ld?.datePublished === "string" ? ld.datePublished : "") ||
    metaContent(html, ["article:published_time", "datePublished", "pubdate"]);
  const publishedAt = dateRaw ? new Date(dateRaw) : null;

  if (!title || title.length < 5) return null;
  if (decodeText(content).length < 40 && summary.length < 40) return null;
  if (decodeText(content).length < 40) {
    content = cleanContent(textToHtml(summaryText || title), origin);
  }

  return {
    title: title.replace(/\s+[|\-–].{0,40}$/, "").trim() || title,
    url: pageUrl,
    summary,
    content,
    coverUrl,
    publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
    author: ldAuthor(ld?.author),
  };
}

export function discoverFeedUrls(html: string, origin: string) {
  const hrefs = [
    ...html.matchAll(
      /<link[^>]+rel=["'][^"']*alternate[^"']*["'][^>]+type=["']application\/(?:rss|atom)\+xml["'][^>]+href=["']([^"']+)["']/gi,
    ),
    ...html.matchAll(
      /<link[^>]+type=["']application\/(?:rss|atom)\+xml["'][^>]+href=["']([^"']+)["']/gi,
    ),
    ...html.matchAll(/href=["']([^"']*(?:rss|feed|atom)[^"']*)["']/gi),
  ].map((m) => m[1]);

  const out: string[] = [];
  const seen = new Set<string>();
  for (const href of hrefs) {
    try {
      const abs = new URL(decodeEntities(href), origin).toString();
      if (seen.has(abs)) continue;
      if (!/rss|feed|atom|xml/i.test(abs)) continue;
      seen.add(abs);
      out.push(abs);
    } catch {
      continue;
    }
  }
  return out;
}

export function extractArticleLinks(html: string, origin: string, take: number) {
  const hrefs = [...html.matchAll(/href=["']([^"'#]+)["']/gi)].map((m) => m[1]);
  const scored: Array<{ url: string; score: number }> = [];
  const seen = new Set<string>();

  for (const href of hrefs) {
    let abs: URL;
    try {
      abs = new URL(decodeEntities(href), origin);
    } catch {
      continue;
    }
    if (abs.origin !== origin) continue;
    const path = abs.pathname;
    if (path === "/" || path.length < 6) continue;
    if (SKIP_PATH.test(path)) continue;
    if (/\.(jpe?g|png|gif|webp|svg|css|js|pdf|zip|mp4)$/i.test(path)) continue;
    const url = abs.toString().replace(/\/$/, "");
    if (seen.has(url)) continue;
    seen.add(url);

    let score = 0;
    if (/\/haber/i.test(path)) score += 6;
    if (/\/20\d{2}\//.test(path)) score += 5;
    if (/-{1,}[\p{L}\d]{4,}/u.test(path)) score += 3;
    if (path.split("/").filter(Boolean).length >= 2) score += 2;
    if (abs.search) score -= 2;
    if (score < 3) continue;
    scored.push({ url, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.max(take * 3, take)).map((s) => s.url);
}

export function extractSitemapLocs(xml: string, origin: string, take: number) {
  const locs = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((m) => decodeEntities(m[1].trim()));
  const articles: string[] = [];
  const nested: string[] = [];
  for (const loc of locs) {
    try {
      const abs = new URL(loc, origin);
      const href = abs.toString();
      if (/sitemap/i.test(href)) nested.push(href);
      else if (!SKIP_PATH.test(abs.pathname) && abs.pathname.length > 5) articles.push(href);
    } catch {
      continue;
    }
  }
  return { articles: articles.slice(0, take * 2), nested: nested.slice(0, 6) };
}
