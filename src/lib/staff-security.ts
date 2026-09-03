import type { Role } from "@prisma/client";

export function isStaffRole(role: Role) {
  return role === "ADMIN" || role === "EDITOR";
}

/** Personel 2FA ayar sayfası — panel içinde kalır. */
export function staffSecuritySetupPath(role: Role) {
  if (role === "ADMIN") return "/admin/guvenlik";
  if (role === "EDITOR") return "/editor/guvenlik";
  return "/hesabim/guvenlik";
}

export function isStaffSecuritySetupPath(pathname: string, role: Role) {
  const setupPath = staffSecuritySetupPath(role);
  return pathname === setupPath || pathname.startsWith(`${setupPath}/`);
}

/**
 * Eskiden personelde 2FA zorunluydu; artık isteğe bağlı.
 * Layout çağrıları kırılmasın diye no-op bırakıldı.
 */
export async function enforceStaff2FA(
  _userId: string,
  _role: Role,
  _pathname?: string,
) {
  return;
}
