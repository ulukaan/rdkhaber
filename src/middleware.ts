import { NextResponse } from "next/server";
import { auth } from "@/auth";

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
});

export const config = {
  matcher: ["/admin/:path*", "/editor/:path*", "/hesabim/:path*"],
};
