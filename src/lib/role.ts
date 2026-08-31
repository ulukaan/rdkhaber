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

export function panelBrandLabel(role: Role) {
  if (role === "ADMIN") return "Yönetim";
  if (role === "EDITOR") return "Editör";
  return "Üye";
}

export function panelFooterLabel(role: Role) {
  if (role === "ADMIN") return "Yönetim paneli";
  if (role === "EDITOR") return "Editör paneli";
  return "Üye paneli";
}
