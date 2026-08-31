"use server";

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit-log";

export async function exportMyDataAction() {
  const session = await requireAuth();
  const userId = session.user.id;

  const [user, bookmarks, reads, comments, submissions, follows] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      },
    }),
    prisma.articleBookmark.findMany({
      where: { userId },
      include: { article: { select: { title: true, slug: true } } },
    }),
    prisma.articleRead.findMany({
      where: { userId },
      include: { article: { select: { title: true, slug: true } } },
      take: 500,
      orderBy: { readAt: "desc" },
    }),
    prisma.comment.findMany({
      where: { userId },
      select: { content: true, createdAt: true, approved: true },
      take: 200,
    }),
    prisma.newsSubmission.findMany({
      where: { submitterId: userId },
      select: { title: true, status: true, createdAt: true },
    }),
    prisma.authorFollow.findMany({
      where: { followerId: userId },
      include: { author: { select: { name: true, slug: true } } },
    }),
  ]);

  await writeAuditLog({ userId, action: "privacy.export" });

  return {
    exportedAt: new Date().toISOString(),
    user,
    bookmarks,
    reads,
    comments,
    submissions,
    follows,
  };
}

export async function deleteMyAccountAction(confirm: string) {
  const session = await requireAuth();
  if (confirm.trim().toUpperCase() !== "SIL") {
    return { error: 'Onay için "SIL" yazın.' };
  }

  await writeAuditLog({ userId: session.user.id, action: "privacy.delete_account" });
  await prisma.user.update({
    where: { id: session.user.id },
    data: { active: false, email: `deleted-${session.user.id}@invalid.local` },
  });

  return { success: true as const };
}
