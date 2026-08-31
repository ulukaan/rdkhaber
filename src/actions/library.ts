"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

function refreshLibrary() {
  revalidatePath("/hesabim");
  revalidatePath("/hesabim/kaydettiklerim");
  revalidatePath("/hesabim/okuduklarim");
  revalidatePath("/hesabim/takip");
}

export async function getArticleLibraryState(articleId: string) {
  const session = await auth();
  if (!session?.user) return { loggedIn: false, bookmarked: false };
  const row = await prisma.articleBookmark.findUnique({
    where: { userId_articleId: { userId: session.user.id, articleId } },
    select: { id: true },
  });
  return { loggedIn: true, bookmarked: Boolean(row) };
}

export async function getAuthorFollowState(authorId: string) {
  const session = await auth();
  if (!session?.user) return { loggedIn: false, following: false, self: false };
  if (session.user.id === authorId) {
    return { loggedIn: true, following: false, self: true };
  }
  const row = await prisma.authorFollow.findUnique({
    where: { followerId_authorId: { followerId: session.user.id, authorId } },
    select: { id: true },
  });
  return { loggedIn: true, following: Boolean(row), self: false };
}

export async function toggleBookmarkAction(articleId: string) {
  const session = await requireAuth();
  const article = await prisma.article.findFirst({
    where: { id: articleId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!article) return { error: "Haber bulunamadı." };

  const existing = await prisma.articleBookmark.findUnique({
    where: { userId_articleId: { userId: session.user.id, articleId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.articleBookmark.delete({ where: { id: existing.id } });
    refreshLibrary();
    return { bookmarked: false };
  }

  await prisma.articleBookmark.create({
    data: { userId: session.user.id, articleId },
  });
  refreshLibrary();
  return { bookmarked: true };
}

export async function recordArticleReadAction(articleId: string) {
  const session = await auth();
  if (!session?.user) return;
  const article = await prisma.article.findFirst({
    where: { id: articleId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!article) return;

  await prisma.articleRead.upsert({
    where: { userId_articleId: { userId: session.user.id, articleId } },
    create: { userId: session.user.id, articleId },
    update: { readAt: new Date() },
  });
}

export async function toggleFollowAction(authorId: string) {
  const session = await requireAuth();
  if (session.user.id === authorId) {
    return { error: "Kendinizi takip edemezsiniz." };
  }

  const author = await prisma.user.findFirst({
    where: { id: authorId, active: true, role: { in: ["ADMIN", "EDITOR"] } },
    select: { id: true },
  });
  if (!author) return { error: "Yazar bulunamadı." };

  const existing = await prisma.authorFollow.findUnique({
    where: { followerId_authorId: { followerId: session.user.id, authorId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.authorFollow.delete({ where: { id: existing.id } });
    refreshLibrary();
    return { following: false };
  }

  await prisma.authorFollow.create({
    data: { followerId: session.user.id, authorId },
  });
  refreshLibrary();
  return { following: true };
}
