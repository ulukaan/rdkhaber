"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { writeAuditLog } from "@/lib/audit-log";
import type { ArticleStatus } from "@prisma/client";

export async function bulkUpdateArticlesAction(input: {
  ids: string[];
  status?: ArticleStatus;
  delete?: boolean;
}) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const ids = [...new Set(input.ids.filter(Boolean))].slice(0, 100);
  if (ids.length === 0) return { error: "Haber seçilmedi." };

  if (input.delete) {
    if (session.user.role !== "ADMIN") return { error: "Silme yalnızca yönetici." };
    await prisma.article.deleteMany({ where: { id: { in: ids } } });
    await writeAuditLog({
      userId: session.user.id,
      action: "article.bulk_delete",
      entity: "Article",
      meta: { count: ids.length },
    });
  } else if (input.status) {
    await prisma.article.updateMany({
      where: { id: { in: ids } },
      data: { status: input.status },
    });
    await writeAuditLog({
      userId: session.user.id,
      action: "article.bulk_status",
      entity: "Article",
      meta: { count: ids.length, status: input.status },
    });
  } else {
    return { error: "İşlem belirtilmedi." };
  }

  revalidatePath("/admin/makaleler");
  revalidatePath("/editor/makaleler");
  return { success: true as const, count: ids.length };
}
