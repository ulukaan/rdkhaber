const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

/** Metin içinden ilk geçerli e-posta adresini çıkarır. */
export function extractEmail(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const match = raw.trim().match(EMAIL_RE);
  return match?.[0]?.toLowerCase() ?? null;
}

export function isValidEmail(raw: string | null | undefined): raw is string {
  if (!raw?.trim()) return false;
  return EMAIL_RE.test(raw.trim()) && raw.trim().length <= 254;
}
