"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { sanitizeArticleHtml } from "@/lib/article-html";
import { getEditableArticle } from "@/lib/article-access";

export async function addLiveBlogUpdateAction(input: {
  articleId: string;
  title?: string;
  body: string;
  pinned?: boolean;
}) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const article = await getEditableArticle(session, input.articleId);
  if (!article) return { error: "Haber bulunamadı." };

  await prisma.liveBlogUpdate.create({
    data: {
      articleId: input.articleId,
      userId: session.user.id,
      title: input.title?.slice(0, 180) ?? null,
      body: sanitizeArticleHtml(input.body).slice(0, 10_000),
      pinned: Boolean(input.pinned),
    },
  });

  await prisma.article.update({
    where: { id: input.articleId },
    data: { isLiveBlog: true },
  });

  revalidatePath(`/haber/${article.slug}`);
  revalidatePath(`/admin/makaleler/${input.articleId}`);
  revalidatePath(`/editor/makaleler/${input.articleId}`);
  return { success: true as const };
}

export async function deleteLiveBlogUpdateAction(id: string) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const row = await prisma.liveBlogUpdate.findUnique({
    where: { id },
    include: { article: { select: { id: true, slug: true, authorId: true } } },
  });
  if (!row) return { error: "Güncelleme bulunamadı." };
  if (!(await getEditableArticle(session, row.article.id))) {
    return { error: "Yetkiniz yok." };
  }

  await prisma.liveBlogUpdate.delete({ where: { id } });
  revalidatePath(`/haber/${row.article.slug}`);
  return { success: true as const };
}

export async function listLiveBlogUpdatesAction(articleId: string) {
  await requireRole(["ADMIN", "EDITOR"]);
  const rows = await prisma.liveBlogUpdate.findMany({
    where: { articleId },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    include: { user: { select: { name: true } } },
  });
  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));
}
