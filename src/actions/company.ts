"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { companySchema } from "@/lib/validation";
import { requireRole } from "@/lib/auth-guard";
import { revalidatePublicSite } from "@/lib/revalidate-site";
import { slugify } from "@/lib/slug";

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function emptyToBlank(value: string | undefined) {
  return value?.trim() ?? "";
}

async function uniqueCompanySlug(name: string, excludeId?: string) {
  const root = slugify(name) || `firma-${Date.now().toString(36)}`;
  let slug = root;
  let n = 2;
  while (true) {
    const existing = await prisma.company.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${root}-${n}`;
    n += 1;
  }
}

function revalidateCompanyPaths() {
  revalidatePath("/admin/firmalar");
  revalidatePublicSite();
}

export async function createCompanyAction(raw: unknown) {
  await requireRole(["ADMIN"]);
  const parsed = companySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const slug = await uniqueCompanySlug(parsed.data.name);
  await prisma.company.create({
    data: {
      name: parsed.data.name.trim(),
      slug,
      logoUrl: emptyToBlank(parsed.data.logoUrl),
      websiteUrl: emptyToBlank(parsed.data.websiteUrl),
      category: emptyToBlank(parsed.data.category),
      phone: emptyToNull(parsed.data.phone),
      description: emptyToNull(parsed.data.description),
      order: parsed.data.order,
      active: parsed.data.active,
    },
  });
  revalidateCompanyPaths();
  return { success: true };
}

export async function updateCompanyAction(id: string, raw: unknown) {
  await requireRole(["ADMIN"]);
  const parsed = companySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const existing = await prisma.company.findUnique({ where: { id }, select: { id: true, name: true, slug: true } });
  if (!existing) return { error: "Firma bulunamadı" };

  const name = parsed.data.name.trim();
  const slug =
    name === existing.name ? existing.slug : await uniqueCompanySlug(name, id);

  await prisma.company.update({
    where: { id },
    data: {
      name,
      slug,
      logoUrl: emptyToBlank(parsed.data.logoUrl),
      websiteUrl: emptyToBlank(parsed.data.websiteUrl),
      category: emptyToBlank(parsed.data.category),
      phone: emptyToNull(parsed.data.phone),
      description: emptyToNull(parsed.data.description),
      order: parsed.data.order,
      active: parsed.data.active,
    },
  });
  revalidateCompanyPaths();
  return { success: true };
}

export async function deleteCompanyAction(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.company.delete({ where: { id } });
  revalidateCompanyPaths();
}

export async function toggleCompanyActiveAction(id: string) {
  await requireRole(["ADMIN"]);
  const company = await prisma.company.findUnique({ where: { id }, select: { active: true } });
  if (!company) return { error: "Firma bulunamadı" };
  await prisma.company.update({ where: { id }, data: { active: !company.active } });
  revalidateCompanyPaths();
  return { success: true };
}
