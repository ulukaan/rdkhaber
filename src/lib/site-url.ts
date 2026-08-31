function normalizeSiteUrl(raw: string) {
  return raw.trim().replace(/^['"]|['"]$/g, "").replace(/\/$/, "");
}

export function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (raw) return normalizeSiteUrl(raw);
  return "http://localhost:3000";
}

/** Hostinger Node binds to 0.0.0.0 — never use that as a public redirect base. */
export function getRequestOrigin(
  req?: Request | { headers: Headers; nextUrl?: { origin: string } },
) {
  const configured = getSiteUrl();
  if (configured && !/0\.0\.0\.0|127\.0\.0\.1|localhost/i.test(configured)) {
    return configured;
  }

  if (req?.headers) {
    const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const host = forwardedHost || req.headers.get("host")?.split(",")[0]?.trim();
    const proto =
      req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      (configured.startsWith("https") ? "https" : "http");
    if (host && !/^0\.0\.0\.0(?::\d+)?$/i.test(host) && !/^127\.0\.0\.1(?::\d+)?$/i.test(host)) {
      return `${proto}://${host}`;
    }
  }

  const nextOrigin =
    req && "nextUrl" in req && req.nextUrl?.origin ? req.nextUrl.origin : undefined;
  if (nextOrigin && !nextOrigin.includes("0.0.0.0")) return nextOrigin;

  return configured.replace(/0\.0\.0\.0/g, "127.0.0.1");
}

export function absoluteUrl(
  path: string,
  req?: Request | { headers: Headers; nextUrl?: { origin: string } },
) {
  return new URL(path, `${getRequestOrigin(req)}/`);
}
