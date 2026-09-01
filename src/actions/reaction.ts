"use server";

import { headers } from "next/headers";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  emptyReactionState,
  isReactionId,
  type ReactionState,
} from "@/lib/reactions";

const COOKIE = "rdk_ifade";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

function validVisitorId(value: string | undefined) {
  if (!value) return false;
  return /^[a-zA-Z0-9_-]{8,64}$/.test(value);
}

async function visitorId(create: boolean) {
  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;
  if (validVisitorId(existing)) return existing as string;
  if (!create) return null;
  const id = crypto.randomUUID();
  jar.set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return id;
}

async function loadState(articleId: string, visitor: string | null): Promise<ReactionState> {
  const rows = await prisma.articleReaction.groupBy({
    by: ["type"],
    where: { articleId },
    _count: { _all: true },
  });
  const state = emptyReactionState();
  for (const row of rows) {
    if (isReactionId(row.type)) state.counts[row.type] = row._count._all;
  }
  if (visitor) {
    const mine = await prisma.articleReaction.findUnique({
      where: { articleId_visitorId: { articleId, visitorId: visitor } },
      select: { type: true },
    });
    if (mine && isReactionId(mine.type)) state.mine = mine.type;
  }
  return state;
}

export async function getArticleReactionsAction(articleId: string): Promise<ReactionState> {
  if (!articleId.trim()) return emptyReactionState();
  const visitor = await visitorId(false);
  try {
    return await loadState(articleId, visitor);
  } catch {
    return emptyReactionState();
  }
}

export async function setArticleReactionAction(
  articleId: string,
  type: string,
): Promise<ReactionState | { error: string }> {
  if (!articleId.trim()) return { error: "Haber bulunamadı." };
  if (!isReactionId(type)) return { error: "Geçersiz ifade." };

  const article = await prisma.article.findFirst({
    where: { id: articleId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!article) return { error: "Haber bulunamadı." };

  const h = await headers();
  const limited = await rateLimit(`reaction:${clientIp(h)}`, {
    limit: 60,
    windowMs: 15 * 60_000,
  });
  if (!limited.ok) {
    return { error: `Çok fazla işlem. ${limited.retryAfterSec} sn sonra tekrar deneyin.` };
  }

  const visitor = await visitorId(true);
  if (!visitor) return { error: "İfade kaydedilemedi." };

  const current = await prisma.articleReaction.findUnique({
    where: { articleId_visitorId: { articleId, visitorId: visitor } },
    select: { type: true },
  });

  if (current?.type === type) {
    await prisma.articleReaction.delete({
      where: { articleId_visitorId: { articleId, visitorId: visitor } },
    });
  } else if (current) {
    await prisma.articleReaction.update({
      where: { articleId_visitorId: { articleId, visitorId: visitor } },
      data: { type },
    });
  } else {
    await prisma.articleReaction.create({
      data: { articleId, visitorId: visitor, type },
    });
  }

  return loadState(articleId, visitor);
}
