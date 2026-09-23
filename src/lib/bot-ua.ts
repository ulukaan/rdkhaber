/** Bilinen crawler / bot User-Agent kalıpları — görüntülenme sayacını şişirmesin. */
const BOT_UA =
  /bot|crawl|spider|slurp|facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegram|discordbot|embedly|quora|pinterest|redditbot|applebot|bingpreview|yandex|baiduspider|duckduckbot|semrush|ahrefs|mj12bot|dotbot|petalbot|bytespider|gptbot|claudebot|anthropic|chatgpt|ccbot|google-extended|ia_archiver|archive\.org|wget|curl|python-requests|go-http-client|headless|phantom|selenium|puppeteer|playwright|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|preview/i;

export function isBotUserAgent(ua: string | null | undefined) {
  if (!ua?.trim()) return true; // UA yoksa bot say (SSR prefetch / tooling)
  return BOT_UA.test(ua);
}
