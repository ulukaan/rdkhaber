const BANNED = [
  "viagra",
  "casino",
  "bahis",
  "kumar",
  "escort",
  "click here",
  "http://",
  "https://",
  "www.",
];

const MAX_LINKS = 2;

export type CommentFilterResult = { ok: true } | { ok: false; reason: string };

/** Yorum spam / küfür / link kontrolü. */
export function filterCommentContent(content: string): CommentFilterResult {
  const text = content.trim();
  if (text.length < 3) return { ok: false, reason: "Yorum çok kısa." };
  if (text.length > 2000) return { ok: false, reason: "Yorum çok uzun." };

  const lower = text.toLocaleLowerCase("tr");
  for (const word of BANNED) {
    if (lower.includes(word)) {
      return { ok: false, reason: "Yorumunuz otomatik filtreye takıldı." };
    }
  }

  const linkCount = (text.match(/https?:\/\/|www\./gi) ?? []).length;
  if (linkCount > MAX_LINKS) {
    return { ok: false, reason: "Yorumda çok fazla bağlantı var." };
  }

  if (/(.)\1{8,}/.test(text)) {
    return { ok: false, reason: "Yorum geçersiz karakterler içeriyor." };
  }

  return { ok: true };
}
