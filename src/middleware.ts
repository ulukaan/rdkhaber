import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { absoluteUrl } from "@/lib/site-url";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/admin")) {
    if (!req.auth?.user) return NextResponse.redirect(absoluteUrl("/giris", req));
    if (role !== "ADMIN") return NextResponse.redirect(absoluteUrl("/", req));
  }

  if (pathname.startsWith("/editor")) {
    if (!req.auth?.user) return NextResponse.redirect(absoluteUrl("/giris", req));
    if (role !== "ADMIN" && role !== "EDITOR") {
      return NextResponse.redirect(absoluteUrl("/", req));
    }
  }

  if (pathname.startsWith("/hesabim")) {
    if (!req.auth?.user) return NextResponse.redirect(absoluteUrl("/giris", req));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/editor/:path*", "/hesabim/:path*"],
};
