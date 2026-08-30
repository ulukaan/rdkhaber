"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { tagSchema } from "@/lib/validation";
import { requireRole } from "@/lib/auth-guard";
import { slugify } from "@/lib/slug";

export async function createTagAction(raw: Record<string, unknown>) {
  await requireRole(["ADMIN"]);
  const parsed = tagSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const slug = slugify(parsed.data.slug || parsed.data.name);
  const existing = await prisma.tag.findUnique({ where: { slug } });
  if (existing) return { error: "Bu etiket zaten var." };

  await prisma.tag.create({ data: { name: parsed.data.name, slug } });
  revalidatePath("/admin/etiketler");
  return { success: true };
}

export async function deleteTagAction(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/admin/etiketler");
}
