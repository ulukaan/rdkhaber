"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { onArticlePublished } from "@/lib/article-publish-hooks";
import { writeAuditLog } from "@/lib/audit-log";

export async function approveArticleAction(id: string) {
  const session = await requireRole(["ADMIN"]);
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return { error: "Haber bulunamadı." };
  if (article.status !== "REVIEW") return { error: "Haber onay beklemiyor." };

  const now = new Date();
  const updated = await prisma.article.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: article.publishedAt ?? now,
      approvedById: session.user.id,
      approvedAt: now,
      scheduledAt: null,
    },
  });

  await onArticlePublished(
    {
      id: updated.id,
      title: updated.title,
      slug: updated.slug,
      summary: updated.summary,
      content: updated.content,
      isBreaking: updated.isBreaking,
      publishedAt: updated.publishedAt,
    },
    { wasPublished: false },
  );

  await writeAuditLog({
    userId: session.user.id,
    action: "article.approve",
    entity: "Article",
    entityId: id,
  });

  revalidatePath("/admin/onay-kuyrugu");
  revalidatePath("/admin/makaleler");
  revalidatePath("/editor/makaleler");
  return { success: true as const };
}

export async function listReviewQueueAction() {
  await requireRole(["ADMIN"]);
  return prisma.article.findMany({
    where: { status: "REVIEW" },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      title: true,
      slug: true,
      updatedAt: true,
      author: { select: { name: true } },
    },
  });
}
