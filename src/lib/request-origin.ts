import { headers } from "next/headers";

/** Aynı-site istekleri doğrula (CSRF’e karşı basit Origin/Referer kontrolü). */
export async function assertSameOriginRequest() {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("host");
  const referer = h.get("referer");

  if (origin && host) {
    try {
      const o = new URL(origin);
      if (o.host !== host) {
        return { ok: false as const, error: "Geçersiz istek kaynağı" };
      }
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "Geçersiz istek kaynağı" };
    }
  }

  if (referer && host) {
    try {
      const r = new URL(referer);
      if (r.host !== host) {
        return { ok: false as const, error: "Geçersiz istek kaynağı" };
      }
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "Geçersiz istek kaynağı" };
    }
  }

  // Bazı tarayıcılar same-site FormData’da Origin göndermeyebilir; host varlığı yeterli değil.
  // API upload için Origin veya Referer zorunlu tutuyoruz.
  return { ok: false as const, error: "İstek doğrulanamadı" };
}
