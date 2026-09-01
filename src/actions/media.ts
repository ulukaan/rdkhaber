"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { hashMediaBuffer } from "@/lib/media-upload";
import { deleteUploadedFile, readUploadedFile } from "@/lib/upload-path";

export async function deleteMediaAction(id: string) {
  await requireRole(["ADMIN"]);
  const row = await prisma.media.findUnique({ where: { id }, select: { url: true } });
  if (!row) return { error: "Kayıt bulunamadı." };
  await prisma.media.delete({ where: { id } });
  await deleteUploadedFile(row.url);
  revalidatePath("/admin/medya");
}

/** Medya seçici modalı için görsel listesi. */
export async function listMediaAction(query?: string) {
  await requireRole(["ADMIN", "EDITOR"]);
  const rows = await prisma.media.findMany({
    where: {
      mimeType: { startsWith: "image/" },
      ...(query ? { filename: { contains: query } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: { id: true, url: true, filename: true },
  });
  return rows;
}

async function replaceMediaUrl(oldUrl: string, newUrl: string) {
  await prisma.article.updateMany({
    where: { coverImageUrl: oldUrl },
    data: { coverImageUrl: newUrl },
  });
  await prisma.article.updateMany({
    where: { imageSocial: oldUrl },
    data: { imageSocial: newUrl },
  });
  await prisma.galleryImage.updateMany({
    where: { imageUrl: oldUrl },
    data: { imageUrl: newUrl },
  });
  await prisma.gallery.updateMany({
    where: { coverImageUrl: oldUrl },
    data: { coverImageUrl: newUrl },
  });
  await prisma.adSlot.updateMany({
    where: { imageUrl: oldUrl },
    data: { imageUrl: newUrl },
  });
}

/** Diskte olmayan medya kayıtlarını siler. */
export async function cleanupBrokenMediaAction() {
  await requireRole(["ADMIN"]);
  const rows = await prisma.media.findMany({ select: { id: true, url: true } });
  let removed = 0;
  for (const row of rows) {
    const file = await readUploadedFile(row.url);
    if (!file) {
      await prisma.media.delete({ where: { id: row.id } });
      removed += 1;
    }
  }
  revalidatePath("/admin/medya");
  return { removed };
}

/** Aynı içerikli kopyaları birleştirir; en eski kayıt kalır. */
export async function dedupeMediaAction() {
  await requireRole(["ADMIN"]);
  const rows = await prisma.media.findMany({ orderBy: { createdAt: "asc" } });
  const hashById = new Map<string, string>();
  const groups = new Map<string, typeof rows>();

  for (const row of rows) {
    let hash = row.contentHash ?? null;
    if (!hash) {
      const file = await readUploadedFile(row.url);
      if (!file) continue;
      hash = hashMediaBuffer(file.buffer);
      await prisma.media.update({ where: { id: row.id }, data: { contentHash: hash } });
    }
    hashById.set(row.id, hash);
    const group = groups.get(hash) ?? [];
    group.push(row);
    groups.set(hash, group);
  }

  let merged = 0;
  let freedBytes = 0;
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const [canonical, ...duplicates] = group;
    for (const dup of duplicates) {
      await replaceMediaUrl(dup.url, canonical.url);
      await prisma.media.delete({ where: { id: dup.id } });
      await deleteUploadedFile(dup.url);
      merged += 1;
      freedBytes += dup.size;
    }
  }

  revalidatePath("/admin/medya");
  return { merged, freedBytes };
}
