/**
 * Search Console HTML etiketi için content değerini temizler.
 * Kullanıcılar sıkça tüm meta satırını veya `google-site-verification=` önekini yapıştırır;
 * Next.js Metadata API zaten doğru attribute adını üretir — content yalnızca token olmalı.
 */
export function normalizeGoogleSiteVerification(raw: string): string {
  let value = raw.trim();
  if (!value) return "";

  const metaContent = value.match(
    /google-site-verification["'\s]*content\s*=\s*["']([^"']+)["']/i,
  );
  if (metaContent?.[1]) {
    value = metaContent[1].trim();
  }

  value = value.replace(/^content\s*=\s*["']?/i, "").replace(/["']\s*$/g, "").trim();

  if (/^google-site-verification\s*=/i.test(value)) {
    value = value.replace(/^google-site-verification\s*=\s*/i, "").trim();
  }

  value = value.replace(/^["']|["']$/g, "").trim();
  return value;
}
