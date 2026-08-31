import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/auth";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/giris");
  return session;
}

export async function requireRole(allowed: Role[]) {
  const session = await requireAuth();
  if (!allowed.includes(session.user.role)) redirect("/");
  return session;
}

export async function getSession() {
  return auth();
}
