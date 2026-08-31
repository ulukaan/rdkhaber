/**
 * Basit bellek içi rate limit (tek süreç). Prod'da birden fazla instance varsa
 * Redis vb. gerekir; yine de brute-force ve spam'i ciddi azaltır.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (current.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }

  current.count += 1;
  return { ok: true };
}

function isPrivateOrLocalIp(ip: string) {
  const value = ip.trim().toLowerCase();
  if (!value || value === "unknown") return true;
  if (value === "::1" || value.startsWith("fe80:") || value.startsWith("fc") || value.startsWith("fd")) {
    return true;
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) {
    const [a, b] = value.split(".").map(Number);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  return false;
}

/** Hostinger/nginx: önce x-real-ip; spoof edilebilir x-forwarded-for zincirinin sonundan seç. */
export function clientIp(headers: Headers | { get(name: string): string | null }) {
  const real = headers.get("x-real-ip")?.trim();
  if (real && !isPrivateOrLocalIp(real)) return real.slice(0, 64);

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i -= 1) {
      const ip = parts[i];
      if (ip && !isPrivateOrLocalIp(ip)) return ip.slice(0, 64);
    }
  }

  return "unknown";
}

/** Periyodik temizlik — bellek şişmesin. */
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now >= bucket.resetAt) buckets.delete(key);
    }
  }, 60_000).unref?.();
}
