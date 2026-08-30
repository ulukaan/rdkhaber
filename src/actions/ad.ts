"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { adSchema } from "@/lib/validation";
import { requireRole } from "@/lib/auth-guard";

export async function createAdAction(raw: Record<string, unknown>) {
  await requireRole(["ADMIN"]);
  const parsed = adSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  await prisma.adSlot.upsert({
    where: { position: parsed.data.position },
    create: parsed.data,
    update: parsed.data,
  });
  revalidatePath("/admin/reklamlar");
  revalidatePath("/");
  return { success: true };
}

export async function updateAdAction(id: string, raw: Record<string, unknown>) {
  await requireRole(["ADMIN"]);
  const parsed = adSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  await prisma.adSlot.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/reklamlar");
  revalidatePath("/");
  return { success: true };
}

export async function deleteAdAction(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.adSlot.delete({ where: { id } });
  revalidatePath("/admin/reklamlar");
  revalidatePath("/");
}

export async function toggleAdActiveAction(id: string) {
  await requireRole(["ADMIN"]);
  const ad = await prisma.adSlot.findUnique({ where: { id } });
  if (!ad) return { error: "Reklam bulunamadı" };
  await prisma.adSlot.update({ where: { id }, data: { active: !ad.active } });
  revalidatePath("/admin/reklamlar");
  revalidatePath("/");
  return { success: true };
}
