/** AdSense snippet'inden slot ve biçim bilgilerini çıkarır. */
export function parseAdsenseSnippet(code: string) {
  const trimmed = code.trim();
  if (!trimmed) return null;

  // Mobil yapıştırmada dönüşen tırnak ve boşlukları normalize et.
  const normalized = trimmed
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u00A0/g, " ");

  const slot =
    normalized.match(/data-ad-slot\s*=\s*["']([^"']+)["']/i)?.[1]?.trim() ??
    normalized.match(/data-ad-slot\s*=\s*(\d{6,12})/i)?.[1]?.trim() ??
    normalized.match(/["']slot["']\s*:\s*["'](\d{6,12})["']/i)?.[1]?.trim();

  const client =
    normalized.match(/data-ad-client\s*=\s*["']([^"']+)["']/i)?.[1]?.trim() ??
    normalized.match(/data-ad-client\s*=\s*(ca-pub-\d+)/i)?.[1]?.trim() ??
    normalized.match(/client=(ca-pub-\d+)/i)?.[1]?.trim();

  const layout = normalized.match(/data-ad-layout\s*=\s*["']([^"']+)["']/i)?.[1]?.trim();
  const format = normalized.match(/data-ad-format\s*=\s*["']([^"']+)["']/i)?.[1]?.trim();

  if (!slot && !client) return null;

  return { slot, client, layout, format };
}

/** Yalnızca rakamlardan oluşan slot numarasını doğrular. */
export function normalizeAdsenseSlot(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length >= 6 ? digits : "";
}

export function resolveAdsenseSlot(input: {
  code?: string | null;
  slot?: string | null;
}) {
  const manual = normalizeAdsenseSlot(input.slot);
  if (manual) return manual;
  return normalizeAdsenseSlot(parseAdsenseSnippet(input.code ?? "")?.slot);
}

export function buildAdsenseSnippet(input: {
  slot?: string | null;
  layout?: string | null;
  format?: string | null;
  client?: string | null;
}) {
  const slot = normalizeAdsenseSlot(input.slot);
  if (!slot) return "";

  const lines = [
    '<ins class="adsbygoogle"',
    '     style="display:block; text-align:center;"',
  ];

  if (input.layout) lines.push(`     data-ad-layout="${input.layout}"`);
  if (input.format) lines.push(`     data-ad-format="${input.format}"`);
  if (input.client) lines.push(`     data-ad-client="${input.client}"`);
  lines.push(`     data-ad-slot="${slot}"></ins>`);
  lines.push("<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>");

  return lines.join("\n");
}
