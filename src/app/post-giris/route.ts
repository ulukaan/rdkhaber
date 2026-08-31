import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { panelPathForRole } from "@/lib/role";

export async function GET(req: Request) {
  const session = await auth();
  const path = session?.user ? panelPathForRole(session.user.role) : "/giris";
  return NextResponse.redirect(new URL(path, req.url));
}
