"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validation";
import { requireRole } from "@/lib/auth-guard";
import { slugify } from "@/lib/slug";
import { categoryHref } from "@/lib/category-path";
import { revalidatePublicSite } from "@/lib/revalidate-site";

function revalidateCategoryPaths(slug: string) {
  revalidatePath(categoryHref(slug));
  revalidatePath(`/kategori/${slug}`);
}

function toCategoryData(parsed: ReturnType<typeof categorySchema.parse>) {
  const isVideo = parsed.videoGallery && !parsed.photoGallery;
  const isPhoto = parsed.photoGallery && !parsed.videoGallery;
  const templateRaw = parsed.fixedTemplate || "klasik";
  const template =
    templateRaw === "liste" || templateRaw === "ekonomi"
      ? "liste"
      : templateRaw === "dergi" || templateRaw === "magazin"
        ? "dergi"
        : "klasik";

  if (isVideo) {
    return {
      name: parsed.name,
      slug: slugify(parsed.slug || parsed.name),
      description: parsed.description?.trim() || null,
      color: parsed.color?.trim() || null,
      order: parsed.order,
      parentId: parsed.parentId?.trim() || null,
      headingH1: parsed.headingH1?.trim() || null,
      boxCount: parsed.boxCount,
      photoGallery: false,
      videoGallery: true,
      fixedDesign: false,
      fixedTemplate: null,
      hoverColor: parsed.hoverColor?.trim() || null,
      headerTextColor: parsed.headerTextColor?.trim() || null,
      headerHoverColor: parsed.headerHoverColor?.trim() || null,
    };
  }

  if (isPhoto) {
    return {
      name: parsed.name,
      slug: slugify(parsed.slug || parsed.name),
      description: parsed.description?.trim() || null,
      color: parsed.color?.trim() || null,
      order: parsed.order,
      parentId: parsed.parentId?.trim() || null,
      headingH1: parsed.headingH1?.trim() || null,
      boxCount: parsed.boxCount,
      photoGallery: true,
      videoGallery: false,
      fixedDesign: false,
      fixedTemplate: null,
      hoverColor: parsed.hoverColor?.trim() || null,
      headerTextColor: parsed.headerTextColor?.trim() || null,
      headerHoverColor: parsed.headerHoverColor?.trim() || null,
    };
  }

  return {
    name: parsed.name,
    slug: slugify(parsed.slug || parsed.name),
    description: parsed.description?.trim() || null,
    color: parsed.color?.trim() || null,
    order: parsed.order,
    parentId: parsed.parentId?.trim() || null,
    headingH1: parsed.headingH1?.trim() || null,
    boxCount: parsed.boxCount,
    photoGallery: false,
    videoGallery: false,
    fixedDesign: true,
    fixedTemplate: template,
    hoverColor: parsed.hoverColor?.trim() || null,
    headerTextColor: parsed.headerTextColor?.trim() || null,
    headerHoverColor: parsed.headerHoverColor?.trim() || null,
  };
}

export async function createCategoryAction(raw: Record<string, unknown>) {
  await requireRole(["ADMIN"]);
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const data = toCategoryData(parsed.data);
  const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
  if (existing) return { error: "Bu adres son eki zaten kullanılıyor." };

  await prisma.category.create({ data });

  revalidatePath("/admin/kategoriler");
  revalidatePublicSite();
  revalidatePath("/kategori");
  revalidateCategoryPaths(data.slug);
  return { success: true };
}

export async function updateCategoryAction(id: string, raw: Record<string, unknown>) {
  await requireRole(["ADMIN"]);
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const data = toCategoryData(parsed.data);
  if (data.parentId === id) return { error: "Kategori kendi üst kategorisi olamaz." };

  const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
  if (existing && existing.id !== id) return { error: "Bu adres son eki zaten kullanılıyor." };

  await prisma.category.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/kategoriler");
  revalidatePublicSite();
  revalidatePath("/kategori");
  revalidateCategoryPaths(data.slug);
  return { success: true };
}

export async function deleteCategoryAction(id: string) {
  await requireRole(["ADMIN"]);
  const articleCount = await prisma.article.count({
    where: {
      OR: [{ categoryId: id }, { extraCategories: { some: { categoryId: id } } }],
    },
  });
  if (articleCount > 0) {
    return { error: "Bu kategoride haberler var, önce onları taşıyın veya silin." };
  }
  const deleted = await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/kategoriler");
  revalidatePublicSite();
  revalidatePath("/kategori");
  revalidateCategoryPaths(deleted.slug);
}
