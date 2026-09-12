import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";
import { getSiteUrl } from "@/lib/site-url";

const { auth } = NextAuth(authConfig);

function withPathname(req: Parameters<Parameters<typeof auth>[0]>[0], response: NextResponse) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);
  response.headers.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
    headers: response.headers,
  });
}

function stripWww(host: string) {
  return host.replace(/^www\./i, "");
}

/** www ↔ apex tekilleştirme — canonical host NEXT_PUBLIC_SITE_URL / SITE_URL. */
function canonicalHostRedirect(req: Parameters<Parameters<typeof auth>[0]>[0]) {
  let canonical: URL;
  try {
    canonical = new URL(getSiteUrl());
  } catch {
    return null;
  }
  if (/localhost|127\.0\.0\.1/i.test(canonical.hostname)) return null;

  const rawHost =
    req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    req.headers.get("host")?.split(",")[0]?.trim();
  if (!rawHost) return null;

  const requestHost = rawHost.toLowerCase();
  const targetHost = canonical.hostname.toLowerCase();
  if (requestHost === targetHost) return null;
  if (stripWww(requestHost) !== stripWww(targetHost)) return null;

  const dest = new URL(req.nextUrl.pathname + req.nextUrl.search, canonical.origin);
  return NextResponse.redirect(dest, 308);
}

export default auth((req) => {
  const hostRedirect = canonicalHostRedirect(req);
  if (hostRedirect) return hostRedirect;

  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/admin")) {
    if (!req.auth?.user) return NextResponse.redirect(new URL("/giris", req.nextUrl));
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (pathname.startsWith("/editor")) {
    if (!req.auth?.user) return NextResponse.redirect(new URL("/giris", req.nextUrl));
    if (role !== "ADMIN" && role !== "EDITOR") {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  if (pathname.startsWith("/hesabim")) {
    if (!req.auth?.user) return NextResponse.redirect(new URL("/giris", req.nextUrl));
  }

  return withPathname(req, NextResponse.next());
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|txt|xml|webmanifest|woff2?)$).*)",
  ],
};
