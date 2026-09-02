/** AdSense snippet'inden slot ve biçim bilgilerini çıkarır. */
export function parseAdsenseSnippet(code: string) {
  const trimmed = code.trim();
  if (!trimmed) return null;

  const slot = trimmed.match(/data-ad-slot=["']([^"']+)["']/i)?.[1]?.trim();
  const client = trimmed.match(/data-ad-client=["']([^"']+)["']/i)?.[1]?.trim();
  const layout = trimmed.match(/data-ad-layout=["']([^"']+)["']/i)?.[1]?.trim();
  const format = trimmed.match(/data-ad-format=["']([^"']+)["']/i)?.[1]?.trim();

  if (!slot && !client) return null;

  return { slot, client, layout, format };
}

export function buildAdsenseSnippet(input: {
  slot?: string | null;
  layout?: string | null;
  format?: string | null;
  client?: string | null;
}) {
  const slot = input.slot?.trim();
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
