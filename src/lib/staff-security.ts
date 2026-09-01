import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function isStaffRole(role: Role) {
  return role === "ADMIN" || role === "EDITOR";
}

/** Personel 2FA kurulum sayfası — panel içinde kalır, public hesap sayfasına gitmez. */
export function staffSecuritySetupPath(role: Role) {
  if (role === "ADMIN") return "/admin/guvenlik";
  if (role === "EDITOR") return "/editor/guvenlik";
  return "/hesabim/guvenlik";
}

export function isStaffSecuritySetupPath(pathname: string, role: Role) {
  const setupPath = staffSecuritySetupPath(role);
  return pathname === setupPath || pathname.startsWith(`${setupPath}/`);
}

/** Personel paneline erişim için 2FA zorunlu (prod). */
export async function enforceStaff2FA(userId: string, role: Role, pathname?: string) {
  if (!isStaffRole(role)) return;
  if (process.env.NODE_ENV !== "production") return;
  if (pathname && isStaffSecuritySetupPath(pathname, role)) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totpEnabled: true },
  });
  if (!user?.totpEnabled) {
    redirect(staffSecuritySetupPath(role));
  }
}
