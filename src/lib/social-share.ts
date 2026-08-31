import { getSettings } from "@/lib/settings";
import { getSiteUrl } from "@/lib/site-url";

type ArticleShare = {
  title: string;
  slug: string;
  summary: string;
  isBreaking: boolean;
};

async function postTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHANNEL_ID?.trim();
  if (!token || !chatId) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    }),
  }).catch(() => {});
}

async function postTwitter(text: string) {
  const bearer = process.env.TWITTER_BEARER_TOKEN?.trim();
  if (!bearer) return;
  // Basit webhook/IFTTT alternatifi — tam API için ayrı entegrasyon gerekir
  const webhook = process.env.TWITTER_WEBHOOK_URL?.trim();
  if (!webhook) return;
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  }).catch(() => {});
}

/** Haber yayınlandığında sosyal kanallara otomatik paylaşım (env ile). */
export async function sharePublishedArticle(article: ArticleShare) {
  const settings = await getSettings();
  if (settings.socialAutoShare !== "1") return;

  const url = `${getSiteUrl()}/haber/${article.slug}`;
  const prefix = article.isBreaking ? "🔴 SON DAKİKA — " : "";
  const text = `${prefix}${article.title}\n\n${article.summary.slice(0, 200)}\n\n${url}`;

  await Promise.all([postTelegram(text), postTwitter(text)]);
}
