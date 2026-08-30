"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { pageSchema } from "@/lib/validation";
import { requireRole } from "@/lib/auth-guard";
import { slugify } from "@/lib/slug";

export async function createPageAction(raw: Record<string, unknown>) {
  await requireRole(["ADMIN"]);
  const parsed = pageSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const slug = slugify(parsed.data.slug || parsed.data.title);
  const existing = await prisma.page.findUnique({ where: { slug } });
  if (existing) return { error: "Bu slug zaten kullanılıyor." };

  await prisma.page.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      published: parsed.data.published,
      slug,
    },
  });
  revalidatePath("/admin/sayfalar");
  revalidatePath(`/sayfa/${slug}`);
  return { success: true };
}

export async function updatePageAction(id: string, raw: Record<string, unknown>) {
  await requireRole(["ADMIN"]);
  const parsed = pageSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const slug = slugify(parsed.data.slug || parsed.data.title);
  const existing = await prisma.page.findUnique({ where: { slug } });
  if (existing && existing.id !== id) return { error: "Bu slug zaten kullanılıyor." };

  await prisma.page.update({
    where: { id },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      published: parsed.data.published,
      slug,
    },
  });
  revalidatePath("/admin/sayfalar");
  revalidatePath(`/sayfa/${slug}`);
  return { success: true };
}

export async function deletePageAction(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.page.delete({ where: { id } });
  revalidatePath("/admin/sayfalar");
}
