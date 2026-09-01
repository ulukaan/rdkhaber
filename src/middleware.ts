import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";

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

export default auth((req) => {
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
  matcher: ["/admin/:path*", "/editor/:path*", "/hesabim/:path*"],
};
