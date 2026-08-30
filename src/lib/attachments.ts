export function parseAttachmentUrls(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const text = raw.trim();
  if (!text) return [];
  if (text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((u): u is string => typeof u === "string" && u.startsWith("/uploads/"));
    } catch {
      return [];
    }
  }
  if (text.includes(",")) {
    return text
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.startsWith("/uploads/"));
  }
  return text.startsWith("/uploads/") ? [text] : [];
}

export function serializeAttachmentUrls(urls: string[]) {
  const clean = urls.filter((u) => u.startsWith("/uploads/"));
  if (clean.length === 0) return null;
  return JSON.stringify(clean);
}

export function isImageAttachment(url: string) {
  return /\.(jpe?g|png|webp|gif)$/i.test(url.split("?")[0] ?? "");
}

export function isVideoAttachment(url: string) {
  return /\.(mp4|webm|mov)$/i.test(url.split("?")[0] ?? "");
}
