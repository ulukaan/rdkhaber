/**
 * Azure Speech has no ElevenLabs-style prompt. Locale + native TR voice
 * carry the character: Türkiye Türkçesi, natural vowels/consonants,
 * news-anchor delivery without English intonation or theatrical pauses.
 */
export const NEWS_LOCALE = "tr-TR";
/** Style 10–15% — only used if a neural style is explicitly set. */
export const NEWS_STYLEDEGREE = "0.12";
/** Speed 0.98 */
export const NEWS_RATE = "98%";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function paragraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.replace(/[ \t]+/g, " ").replace(/\n/g, " ").trim())
    .filter(Boolean);
}

export function toNewsAnchorSsml(text: string, voice: string, style: string | null, styledegree: string, rate = NEWS_RATE) {
  const body = paragraphs(text).join(" ");
  const xml = escapeXml(body);
  const paced = `<prosody rate="${escapeXml(rate)}">${xml}</prosody>`;
  const styled = style
    ? `<mstts:express-as style="${escapeXml(style)}" styledegree="${escapeXml(styledegree)}">${paced}</mstts:express-as>`
    : paced;

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${NEWS_LOCALE}">
  <voice name="${escapeXml(voice)}" xml:lang="${NEWS_LOCALE}"><lang xml:lang="${NEWS_LOCALE}">${styled}</lang></voice>
</speak>`;
}
