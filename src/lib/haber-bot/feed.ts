import { sanitizeArticleHtml } from "@/lib/article-html";
import {
  cleanContent,
  decodeEntities,
  decodeText,
  discoverFeedUrls,
  extractArticleFromHtml,
  extractArticleLinks,
  extractSitemapLocs,
  type ScrapedArticle,
} from "@/lib/haber-bot/scrape";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const FETCH_HEADERS = {
  "User-Agent": UA,
  Accept: "text/html,application/xhtml+xml,application/rss+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
};

export type NormalizedPost = {
  title: string;
  url: string;
  summary: string;
  content: string;
  coverUrl: string | null;
  publishedAt: Date | null;
  author: string | null;
};

type WpPost = {
  id: number;
  slug: string;
  date: string;
  link: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
  _embedded?: {
    author?: Array<{ name?: string }>;
    "wp:featuredmedia"?: Array<{ source_url?: string }>;
  };
};

function toSummary(excerpt: string, content: string) {
  const fromExcerpt = decodeText(excerpt);
  if (fromExcerpt.length > 40) {
    return fromExcerpt.length > 360 ? `${fromExcerpt.slice(0, 357).trim()}…` : fromExcerpt;
  }
  const fromBody = decodeText(content);
  if (!fromBody) return "Haber özeti";
  return fromBody.length > 360 ? `${fromBody.slice(0, 357).trim()}…` : fromBody;
}

export function normalizeSourceUrl(raw: string) {
  const trimmed = raw.trim();
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withProto);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Geçerli bir site adresi girin");
  }
  return parsed.toString().replace(/\/$/, "");
}

export async function normalizeSourceUrlSafe(raw: string) {
  const { assertSafePublicUrl } = await import("@/lib/ssrf");
  const url = await assertSafePublicUrl(raw);
  return url.toString().replace(/\/$/, "");
}

function isFeedUrl(url: string) {
  return /(?:\/feed\/?|\.xml$|\/rss\/?|\/atom\/?|[?&]feed=)/i.test(url);
}

async function fetchText(url: string) {
  const { safeFetch } = await import("@/lib/safe-fetch");
  const res = await safeFetch(url, {
    followRedirects: true,
    maxRedirects: 1,
    headers: {
      Accept: "text/html,application/xhtml+xml,application/rss+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}

function innerTag(block: string, names: string[]) {
  for (const name of names) {
    const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i");
    const match = block.match(re);
    if (match) return decodeEntities(match[1].trim());
  }
  return "";
}

function attrTag(block: string, tag: string, attr: string) {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["'][^>]*/?>`, "i");
  return block.match(re)?.[1]?.trim() ?? "";
}

function parseDate(raw: string) {
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseFeed(xml: string, origin: string): NormalizedPost[] {
  const itemBlocks =
    xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];

  return itemBlocks
    .map((block) => {
      const title = decodeText(innerTag(block, ["title"]));
      const link =
        decodeText(innerTag(block, ["link", "guid", "id"])) || attrTag(block, "link", "href");
      const content = innerTag(block, ["content:encoded", "content", "description", "summary"]);
      const excerpt = innerTag(block, ["description", "summary"]);
      const cover =
        attrTag(block, "media:content", "url") ||
        attrTag(block, "media:thumbnail", "url") ||
        attrTag(block, "enclosure", "url") ||
        content.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ||
        null;
      const publishedAt = parseDate(innerTag(block, ["pubDate", "published", "updated", "dc:date"]));
      const author = decodeText(innerTag(block, ["dc:creator", "author", "name"])) || null;

      if (!title || !link) return null;

      let url = link;
      try {
        url = new URL(link, origin).toString();
      } catch {
        return null;
      }

      let coverUrl = cover;
      if (coverUrl) {
        try {
          coverUrl = new URL(coverUrl, origin).toString();
        } catch {
          coverUrl = null;
        }
      }

      return {
        title,
        url,
        summary: toSummary(excerpt, content),
        content: sanitizeArticleHtml(
          content.includes("<") ? cleanContent(content, origin) : `<p>${decodeText(content)}</p>`,
        ),
        coverUrl,
        publishedAt,
        author,
      } satisfies NormalizedPost;
    })
    .filter((post): post is NormalizedPost => Boolean(post));
}

async function tryFeed(url: string, origin: string): Promise<NormalizedPost[]> {
  const xml = await fetchText(url);
  if (!/<rss|<feed|<rdf|<item[\s>]|<entry[\s>]/i.test(xml)) return [];
  return parseFeed(xml, origin);
}

async function fetchWpRest(origin: string, maxItems: number): Promise<NormalizedPost[]> {
  const endpoint = `${origin}/wp-json/wp/v2/posts?per_page=${Math.min(maxItems, 30)}&_embed=1&status=publish`;
  const { safeFetch } = await import("@/lib/safe-fetch");
  const res = await safeFetch(endpoint, {
    headers: { ...FETCH_HEADERS, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`WordPress API ${res.status}`);
  const posts = (await res.json()) as WpPost[];
  if (!Array.isArray(posts)) throw new Error("WordPress yanıtı geçersiz");

  return posts.map((post) => {
    const content = post.content?.rendered ?? "";
    const excerpt = post.excerpt?.rendered ?? "";
    const cover = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;
    const author = post._embedded?.author?.[0]?.name ?? null;
    const title = decodeText(post.title?.rendered ?? "");
    return {
      title,
      url: post.link,
      summary: toSummary(excerpt, content),
      content: cleanContent(content, origin),
      coverUrl: cover,
      publishedAt: parseDate(post.date),
      author,
    } satisfies NormalizedPost;
  });
}

function unique(urls: string[]) {
  const seen = new Set<string>();
  return urls.filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
}

function turkishFeedCandidates(origin: string, pageUrl: string) {
  return unique([
    `${origin}/feed/`,
    `${origin}/feed`,
    `${origin}/rss`,
    `${origin}/rss.xml`,
    `${origin}/rss.php`,
    `${origin}/atom.xml`,
    `${origin}/?feed=rss2`,
    `${origin}/index.xml`,
    `${origin}/sondakika.xml`,
    `${origin}/sondakika.rss`,
    `${origin}/rss/sondakika`,
    `${origin}/rss/gundem`,
    `${origin}/rss/haberler`,
    `${origin}/haberler.xml`,
    `${origin}/export/rss`,
    pageUrl.endsWith("/") ? `${pageUrl}feed/` : `${pageUrl}/feed/`,
  ]);
}

function sitemapCandidates(origin: string) {
  return [
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/wp-sitemap.xml`,
    `${origin}/news-sitemap.xml`,
    `${origin}/sitemap-news.xml`,
    `${origin}/news.xml`,
  ];
}

async function scrapeArticles(urls: string[], take: number): Promise<NormalizedPost[]> {
  const posts: NormalizedPost[] = [];
  const seen = new Set<string>();

  for (const href of urls) {
    if (posts.length >= take) break;
    const key = href.replace(/\/$/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      const html = await fetchText(href);
      const article = extractArticleFromHtml(html, href);
      if (!article) continue;
      posts.push(scrapedToPost(article));
    } catch {
      continue;
    }
  }
  return posts;
}

function scrapedToPost(article: ScrapedArticle): NormalizedPost {
  return {
    title: article.title,
    url: article.url,
    summary: article.summary,
    content: article.content,
    coverUrl: article.coverUrl,
    publishedAt: article.publishedAt,
    author: article.author,
  };
}

async function scrapeFromSitemap(origin: string, take: number): Promise<NormalizedPost[]> {
  for (const sitemap of sitemapCandidates(origin)) {
    try {
      const xml = await fetchText(sitemap);
      if (!/<urlset|<sitemapindex/i.test(xml)) continue;
      const { articles, nested } = extractSitemapLocs(xml, origin, take);
      if (articles.length) {
        const posts = await scrapeArticles(articles, take);
        if (posts.length) return posts;
      }
      for (const child of nested) {
        try {
          const childXml = await fetchText(child);
          const childLocs = extractSitemapLocs(childXml, origin, take);
          if (!childLocs.articles.length) continue;
          const posts = await scrapeArticles(childLocs.articles, take);
          if (posts.length) return posts;
        } catch {
          continue;
        }
      }
    } catch {
      continue;
    }
  }
  return [];
}

export async function fetchSourcePosts(rawUrl: string, maxItems: number): Promise<NormalizedPost[]> {
  const url = await normalizeSourceUrlSafe(rawUrl);
  const origin = new URL(url).origin;
  const take = Math.min(Math.max(maxItems, 1), 30);

  if (/wp-json/i.test(url)) {
    return (await fetchWpRest(origin, take)).slice(0, take);
  }

  if (isFeedUrl(url)) {
    const posts = await tryFeed(url, origin);
    if (posts.length) return posts.slice(0, take);
  }

  try {
    const wpPosts = await fetchWpRest(origin, take);
    if (wpPosts.length) return wpPosts.slice(0, take);
  } catch {
    // diğer yöntemlere düş
  }

  let homepageHtml = "";
  try {
    homepageHtml = await fetchText(url);
  } catch {
    try {
      homepageHtml = await fetchText(origin);
    } catch {
      homepageHtml = "";
    }
  }

  const discovered = homepageHtml ? discoverFeedUrls(homepageHtml, origin) : [];
  for (const feed of unique([...discovered, ...turkishFeedCandidates(origin, url)])) {
    try {
      const posts = await tryFeed(feed, origin);
      if (posts.length) return posts.slice(0, take);
    } catch {
      continue;
    }
  }

  const fromSitemap = await scrapeFromSitemap(origin, take);
  if (fromSitemap.length) return fromSitemap.slice(0, take);

  if (homepageHtml) {
    const listingUrls = extractArticleLinks(homepageHtml, origin, take);
    const extraPages = unique([
      `${origin}/gundem`,
      `${origin}/son-dakika`,
      `${origin}/sondakika`,
      `${origin}/haberler`,
      `${origin}/kategori/gundem`,
    ]).filter((p) => p !== url);

    for (const extra of extraPages) {
      if (listingUrls.length >= take * 3) break;
      try {
        const html = await fetchText(extra);
        listingUrls.push(...extractArticleLinks(html, origin, take));
      } catch {
        continue;
      }
    }

    const posts = await scrapeArticles(unique(listingUrls), take);
    if (posts.length) return posts.slice(0, take);
  }

  throw new Error(
    "Bu siteden haber çekilemedi. Ana sayfa adresini yazın; bot RSS, WordPress veya site HTML’inden dener.",
  );
}
