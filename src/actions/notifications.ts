"use server";

import { requireAuth } from "@/lib/auth-guard";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function listNotificationsAction() {
  const session = await requireAuth();
  const items = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return items.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
    readAt: n.readAt?.toISOString() ?? null,
  }));
}

export async function markNotificationReadAction(id: string) {
  const session = await requireAuth();
  await prisma.notification.updateMany({
    where: { id, userId: session.user.id },
    data: { readAt: new Date() },
  });
  revalidatePath("/hesabim/bildirimler");
}

export async function markAllNotificationsReadAction() {
  const session = await requireAuth();
  await prisma.notification.updateMany({
    where: { userId: session.user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/hesabim/bildirimler");
}

export async function getUnreadNotificationCountAction() {
  const session = await auth();
  if (!session?.user) return 0;
  return prisma.notification.count({
    where: { userId: session.user.id, readAt: null },
  });
}

export async function getRecentNotificationsAction(limit = 5) {
  const session = await auth();
  if (!session?.user) return [];
  const items = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return items.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    href: n.href,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  }));
}
