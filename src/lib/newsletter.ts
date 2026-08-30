import sanitizeHtml from "sanitize-html";
import { getSiteUrl } from "@/lib/site-url";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { decodeText } from "@/lib/haber-bot/scrape";
import { escapeHtml, wrapCorporateEmailHtml } from "@/lib/email-template";

export function sanitizeNewsletterHtml(content: string) {
  return sanitizeHtml(content, {
    allowedTags: [
      "p",
      "h1",
      "h2",
      "h3",
      "h4",
      "blockquote",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "ul",
      "ol",
      "li",
      "a",
      "br",
      "img",
      "figure",
      "figcaption",
      "span",
      "div",
      "table",
      "thead",
      "tbody",
      "tr",
      "td",
      "th",
      "hr",
    ],
    allowedAttributes: {
      "*": ["style", "align"],
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      table: ["width", "cellpadding", "cellspacing", "role", "border"],
      td: ["width", "colspan", "rowspan"],
      th: ["width", "colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  });
}

export function wrapNewsletterHtml({
  siteName,
  brandColor,
  logoUrl,
  siteUrl,
  contactEmail,
  siteSlogan,
  content,
  preheader,
  unsubscribeUrl,
}: {
  siteName: string;
  brandColor: string;
  logoUrl?: string;
  siteUrl: string;
  contactEmail: string;
  siteSlogan: string;
  content: string;
  preheader?: string;
  unsubscribeUrl: string;
}) {
  const footerNote = `Bu e-postayı ${escapeHtml(siteName)} bültenine abone olduğunuz için aldınız. <a href="${escapeHtml(unsubscribeUrl)}" style="color:${brandColor};text-decoration:none;font-weight:600;">Abonelikten çık</a>`;

  return wrapCorporateEmailHtml({
    siteName,
    brandColor,
    logoUrl,
    siteUrl,
    contactEmail,
    siteSlogan,
    preheader,
    eyebrow: "Bülten",
    title: siteName,
    contentHtml: sanitizeNewsletterHtml(content),
    footerNote,
  });
}

export async function buildNewsDigestHtml(take = 8) {
  const [settings, articles] = await Promise.all([
    getSettings(),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take,
      select: { title: true, slug: true, summary: true, coverImageUrl: true },
    }),
  ]);
  const base = getSiteUrl();
  if (articles.length === 0) {
    return "<p>Yayında haber yok. Bülteni kendiniz yazabilirsiniz.</p>";
  }

  const items = articles
    .map((a) => {
      const url = `${base}/haber/${a.slug}`;
      const img = a.coverImageUrl
        ? `<img src="${a.coverImageUrl.startsWith("http") ? a.coverImageUrl : `${base}${a.coverImageUrl}`}" alt="" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin-bottom:10px;" />`
        : "";
      const summary = decodeText(a.summary);
      return `<p style="margin:0 0 22px;">
        ${img}
        <a href="${url}" style="color:${settings.brandColor};font-size:18px;font-weight:bold;text-decoration:none;">${escapeHtml(a.title)}</a><br />
        <span style="color:#4b5563;font-size:14px;">${escapeHtml(summary)}</span>
      </p>`;
    })
    .join("");

  return `<p>Merhaba,</p><p>${escapeHtml(settings.siteName)} gündeminden öne çıkan haberler:</p>${items}<p>İyi okumalar.</p>`;
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function buildSingleArticleNewsletterHtml(articleId: string) {
  const [settings, article] = await Promise.all([
    getSettings(),
    prisma.article.findFirst({
      where: { id: articleId, status: "PUBLISHED" },
      select: {
        title: true,
        slug: true,
        summary: true,
        content: true,
        coverImageUrl: true,
      },
    }),
  ]);

  if (!article) return null;

  const base = getSiteUrl();
  const url = `${base}/haber/${article.slug}`;
  const img = article.coverImageUrl
    ? `<img src="${article.coverImageUrl.startsWith("http") ? article.coverImageUrl : `${base}${article.coverImageUrl}`}" alt="" width="560" style="width:100%;max-width:560px;height:auto;display:block;margin:0 0 16px;border-radius:2px;" />`
    : "";
  const excerpt =
    decodeText(article.summary) || stripHtml(article.content).slice(0, 320);
  const preheader = excerpt.slice(0, 140);

  const html = `<p>Merhaba,</p>
${img}
<p style="margin:0 0 12px;font-size:22px;line-height:1.35;font-weight:800;color:#14181f;">
  <a href="${url}" style="color:#14181f;text-decoration:none;">${escapeHtml(article.title)}</a>
</p>
<p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.65;">${escapeHtml(excerpt)}</p>
<p style="margin:0;">
  <a href="${url}" style="display:inline-block;background:${settings.brandColor};color:#ffffff;font-weight:bold;text-decoration:none;padding:12px 24px;">
    Haberi oku
  </a>
</p>`;

  return {
    html,
    subject: article.title,
    preheader,
  };
}

export function parseSubscriberImport(raw: string) {
  const rows: Array<{ email: string; name: string }> = [];
  const seen = new Set<string>();
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split(/[,;\t]/).map((p) => p.trim());
    const email = (parts.find((p) => p.includes("@")) ?? parts[0]).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
    if (seen.has(email)) continue;
    seen.add(email);
    const name = parts.find((p) => p && p !== email) ?? "";
    rows.push({ email, name });
  }
  return rows;
}
