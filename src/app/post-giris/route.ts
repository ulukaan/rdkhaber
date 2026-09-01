import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { panelPathForRole } from "@/lib/role";
import { isStaffRole } from "@/lib/staff-security";
import { absoluteUrl } from "@/lib/site-url";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(absoluteUrl("/giris", req));
  }

  if (isStaffRole(session.user.role)) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { totpEnabled: true },
    });
    if (!user?.totpEnabled) {
      return NextResponse.redirect(absoluteUrl("/hesabim/guvenlik", req));
    }
  }

  const path = panelPathForRole(session.user.role);
  return NextResponse.redirect(absoluteUrl(path, req));
}
