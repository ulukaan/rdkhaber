import { createHash } from "node:crypto";
import { getSiteUrl } from "@/lib/site-url";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const INDEXNOW_KEY_PATH = "/indexnow-key.txt";

/** Ortam anahtarı yoksa AUTH_SECRET / CRON_SECRET’tan kararlı 32 hex üretir. */
export function getIndexNowKey(): string | null {
  const explicit = process.env.INDEXNOW_KEY?.trim();
  if (explicit) return explicit;
  const seed =
    process.env.AUTH_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "";
  if (!seed) return null;
  return createHash("sha256").update(`indexnow:${seed}`).digest("hex").slice(0, 32);
}

export function getIndexNowKeyLocation(base = getSiteUrl()) {
  return `${base.replace(/\/$/, "")}${INDEXNOW_KEY_PATH}`;
}

/**
 * Bing / Yandex / Naver IndexNow — Google Search Console’un yerine geçmez;
 * yayın sonrası hızlı keşif için yan kanal.
 */
export async function submitUrlsToIndexNow(urls: string[]): Promise<{
  ok: boolean;
  submitted: number;
  status?: number;
  skipped?: string;
}> {
  const key = getIndexNowKey();
  if (!key) return { ok: false, submitted: 0, skipped: "no_key" };

  const unique = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
  if (unique.length === 0) return { ok: true, submitted: 0, skipped: "empty" };

  const base = getSiteUrl();
  let host: string;
  try {
    host = new URL(base).host;
  } catch {
    return { ok: false, submitted: 0, skipped: "bad_site_url" };
  }

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: getIndexNowKeyLocation(base),
        urlList: unique.slice(0, 10000),
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const ok = res.status === 200 || res.status === 202;
    return { ok, submitted: unique.length, status: res.status };
  } catch {
    return { ok: false, submitted: 0, skipped: "network" };
  }
}

export async function submitArticleToIndexNow(slug: string) {
  const base = getSiteUrl().replace(/\/$/, "");
  return submitUrlsToIndexNow([`${base}/haber/${slug}`, base]);
}
