import type { Role } from "@prisma/client";

export function panelPathForRole(role: Role) {
  if (role === "ADMIN") return "/admin";
  if (role === "EDITOR") return "/editor";
  return "/hesabim";
}

export function roleLabel(role: Role) {
  if (role === "ADMIN") return "Yönetici";
  if (role === "EDITOR") return "Editör";
  return "Üye";
}
