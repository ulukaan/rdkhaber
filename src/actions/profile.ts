"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { profileSchema } from "@/lib/validation";
import { hashPassword, verifyPassword } from "@/lib/password";
import { unstable_update } from "@/auth";

export async function updateOwnProfileAction(raw: Record<string, unknown>) {
  const session = await requireRole(["USER"]);
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const data = parsed.data;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, passwordHash: true },
  });
  if (!user) return { error: "Hesap bulunamadı." };

  if (data.email !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email: data.email } });
    if (taken) return { error: "Bu e-posta başka bir hesapta kayıtlı." };
  }

  if (data.password?.trim()) {
    const current = data.currentPassword?.trim() ?? "";
    const valid = await verifyPassword(current, user.passwordHash);
    if (!valid) return { error: "Mevcut şifre hatalı." };
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: data.name,
      email: data.email,
      bio: data.bio?.trim() || null,
      avatarUrl: data.avatarUrl?.trim() || null,
      ...(data.password?.trim() ? { passwordHash: await hashPassword(data.password) } : {}),
    },
    select: { name: true, email: true, avatarUrl: true },
  });

  try {
    await unstable_update({
      user: {
        name: updated.name,
        email: updated.email,
        image: updated.avatarUrl,
      },
    });
  } catch {
    // Oturum yenilenmese bile veritabanı güncellenir.
  }

  revalidatePath("/hesabim");
  revalidatePath("/hesabim/profil");
  return { success: true as const };
}
