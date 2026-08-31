"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { getEditableArticle } from "@/lib/article-access";
import { writeAuditLog } from "@/lib/audit-log";

export async function addArticleCorrectionAction(input: { articleId: string; note: string }) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const article = await getEditableArticle(session, input.articleId);
  if (!article) return { error: "Haber bulunamadı." };
  const note = input.note.trim();
  if (note.length < 5) return { error: "Düzeltme notu en az 5 karakter olmalı." };

  await prisma.articleCorrection.create({
    data: {
      articleId: input.articleId,
      userId: session.user.id,
      note: note.slice(0, 2000),
    },
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "article.correction",
    entity: "Article",
    entityId: input.articleId,
  });

  revalidatePath(`/haber/${article.slug}`);
  return { success: true as const };
}

export async function listArticleCorrectionsAction(articleId: string) {
  const rows = await prisma.articleCorrection.findMany({
    where: { articleId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { user: { select: { name: true } } },
  });
  return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
}
