"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

export async function deleteMediaAction(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.media.delete({ where: { id } });
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
