import { assertSafePublicUrl } from "@/lib/ssrf";

type SafeFetchInit = RequestInit & {
  /** Yönlendirme hedefi tekrar doğrulansın (varsayılan: true). */
  followRedirects?: boolean;
  maxRedirects?: number;
};

const DEFAULT_UA =
  "Mozilla/5.0 (compatible; RDHaberBot/1.0; +https://duzceradikal.com)";

/** SSRF korumalı fetch — her istek öncesi URL yeniden doğrulanır. */
export async function safeFetch(rawUrl: string, init: SafeFetchInit = {}) {
  const { followRedirects = false, maxRedirects = 1, ...requestInit } = init;

  let current = await assertSafePublicUrl(rawUrl);
  let redirects = 0;

  while (true) {
    await assertSafePublicUrl(current.toString());

    const res = await fetch(current.toString(), {
      ...requestInit,
      redirect: "manual",
      headers: {
        "User-Agent": DEFAULT_UA,
        ...(requestInit.headers ?? {}),
      },
    });

    if (
      followRedirects &&
      res.status >= 300 &&
      res.status < 400 &&
      redirects < maxRedirects
    ) {
      const location = res.headers.get("location");
      if (!location) return res;
      current = await assertSafePublicUrl(new URL(location, current).toString());
      redirects += 1;
      continue;
    }

    return res;
  }
}
