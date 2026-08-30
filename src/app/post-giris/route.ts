import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { panelPathForRole } from "@/lib/role";
import { absoluteUrl } from "@/lib/site-url";

export async function GET(req: Request) {
  const session = await auth();
  const path = session?.user ? panelPathForRole(session.user.role) : "/giris";
  return NextResponse.redirect(absoluteUrl(path, req));
}
