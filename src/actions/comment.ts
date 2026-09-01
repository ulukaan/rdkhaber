"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { requireRole } from "@/lib/auth-guard";
import { commentSchema } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { filterCommentContent } from "@/lib/comment-filter";
import { notifyCommentApproved } from "@/lib/engagement-notify";

export async function submitCommentAction(values: {
  articleId: string;
  content: string;
  authorName: string;
  authorEmail?: string;
}) {
  const h = await headers();
  const limited = rateLimit(`comment:${clientIp(h)}`, { limit: 10, windowMs: 15 * 60_000 });
  if (!limited.ok) {
    return { error: `Çok fazla yorum. ${limited.retryAfterSec} sn sonra tekrar deneyin.` };
  }

  const parsed = commentSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const filtered = filterCommentContent(parsed.data.content);
  if (!filtered.ok) return { error: filtered.reason };

  const session = await auth();
  const article = await prisma.article.findUnique({ where: { id: parsed.data.articleId } });
  if (!article) return { error: "Haber bulunamadı." };

  await prisma.comment.create({
    data: {
      articleId: parsed.data.articleId,
      content: parsed.data.content.slice(0, 2000),
      authorName: (session?.user?.name ?? parsed.data.authorName).slice(0, 80),
      authorEmail: session?.user?.email ?? (parsed.data.authorEmail || null),
      userId: session?.user?.id,
    },
  });

  revalidatePath(`/haber/${article.slug}`);
  return { success: true };
}

export async function approveCommentAction(id: string) {
  await requireRole(["ADMIN", "EDITOR"]);
  await prisma.comment.update({ where: { id }, data: { approved: true } });
  await notifyCommentApproved(id).catch(() => {});
  revalidatePath("/admin/yorumlar");
  revalidatePath("/editor/yorumlar");
}

export async function deleteCommentAction(id: string) {
  await requireRole(["ADMIN", "EDITOR"]);
  await prisma.comment.delete({ where: { id } });
  revalidatePath("/admin/yorumlar");
  revalidatePath("/editor/yorumlar");
}
