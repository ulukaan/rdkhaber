import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function isStaffRole(role: Role) {
  return role === "ADMIN" || role === "EDITOR";
}

/** Personel paneline erişim için 2FA zorunlu (prod). */
export async function enforceStaff2FA(userId: string, role: Role) {
  if (!isStaffRole(role)) return;
  if (process.env.NODE_ENV !== "production") return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totpEnabled: true },
  });
  if (!user?.totpEnabled) {
    redirect("/hesabim/guvenlik");
  }
}
