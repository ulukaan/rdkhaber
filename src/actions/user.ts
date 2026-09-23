"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { userSchema } from "@/lib/validation";
import { requireRole } from "@/lib/auth-guard";
import { hashPassword } from "@/lib/password";
import { slugify } from "@/lib/slug";
import { uniqueAuthorSlug } from "@/lib/authors";

export async function createUserAction(raw: Record<string, unknown>) {
  await requireRole(["ADMIN"]);
  const parsed = userSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  if (!parsed.data.password) {
    return { error: "Yeni kullanıcı için şifre gerekli." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "Bu e-posta zaten kayıtlı." };

  const requestedSlug = slugify(parsed.data.slug || parsed.data.name);
  const slug = await uniqueAuthorSlug(requestedSlug || parsed.data.name);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      active: parsed.data.active,
      slug,
      bio: parsed.data.bio?.trim() || null,
      avatarUrl: parsed.data.avatarUrl?.trim() || null,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  revalidatePath("/admin/kullanicilar");
  revalidatePath("/admin/yazarlar");
  revalidatePath("/yazarlar");
  revalidatePath("/");
  return { success: true };
}

export async function updateUserAction(id: string, raw: Record<string, unknown>) {
  const session = await requireRole(["ADMIN"]);
  const parsed = userSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  if (session.user.id === id && parsed.data.role !== "ADMIN") {
    return { error: "Kendi yönetici rolünüzü değiştiremezsiniz." };
  }

  const requestedSlug = slugify(parsed.data.slug || parsed.data.name);
  const slug = await uniqueAuthorSlug(requestedSlug || parsed.data.name, id);

  const updated = await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      active: parsed.data.active,
      slug,
      bio: parsed.data.bio?.trim() || null,
      avatarUrl: parsed.data.avatarUrl?.trim() || null,
      ...(parsed.data.password ? { passwordHash: await hashPassword(parsed.data.password) } : {}),
    },
  });

  revalidatePath("/admin/kullanicilar");
  revalidatePath("/admin/yazarlar");
  revalidatePath("/yazarlar");
  revalidatePath("/");
  if (updated.slug) revalidatePath(`/yazar/${updated.slug}`);
  return { success: true };
}

export async function deleteUserAction(id: string) {
  const session = await requireRole(["ADMIN"]);
  if (session.user.id === id) {
    return { error: "Kendi hesabınızı silemezsiniz." };
  }
  try {
    await prisma.user.delete({ where: { id } });
  } catch {
    return { error: "Bu kullanıcının haberleri var, önce onları başka bir yazara taşıyın." };
  }
  revalidatePath("/admin/kullanicilar");
  revalidatePath("/admin/yazarlar");
  revalidatePath("/yazarlar");
  revalidatePath("/");
}
