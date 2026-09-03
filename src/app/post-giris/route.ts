import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { panelPathForRole } from "@/lib/role";
import { absoluteUrl } from "@/lib/site-url";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(absoluteUrl("/giris", req));
  }

  const path = panelPathForRole(session.user.role);
  return NextResponse.redirect(absoluteUrl(path, req));
}
