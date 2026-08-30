"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { gallerySchema } from "@/lib/validation";
import { requireRole } from "@/lib/auth-guard";
import { slugify } from "@/lib/slug";

export async function createGalleryAction(raw: Record<string, unknown>) {
  await requireRole(["ADMIN"]);
  const parsed = gallerySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  const slug = slugify(parsed.data.slug || parsed.data.title);
  const existing = await prisma.gallery.findUnique({ where: { slug } });
  if (existing) return { error: "Bu slug zaten kullanılıyor." };

  await prisma.gallery.create({
    data: {
      title: parsed.data.title,
      slug,
      coverImageUrl: parsed.data.coverImageUrl || null,
    },
  });
  revalidatePath("/admin/galeriler");
  return { success: true };
}

export async function deleteGalleryAction(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.gallery.delete({ where: { id } });
  revalidatePath("/admin/galeriler");
}
