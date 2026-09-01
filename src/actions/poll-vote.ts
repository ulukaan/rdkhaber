"use server";

import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { buildPollPercents, emptyPollState, isPollOpen, type PollState } from "@/lib/polls";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const COOKIE = "rdk_anket";
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

async function loadPollState(pollId: string, visitor: string | null): Promise<PollState | null> {
  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: {
      options: { orderBy: { order: "asc" } },
    },
  });
  if (!poll || !poll.active) return null;

  const closed = !isPollOpen(poll.endsAt, poll.active);
  const counts = await prisma.pollVote.groupBy({
    by: ["optionId"],
    where: { pollId },
    _count: { _all: true },
  });
  const countMap = new Map(counts.map((row) => [row.optionId, row._count._all]));
  const optionRows = poll.options.map((option) => ({
    id: option.id,
    label: option.label,
    count: countMap.get(option.id) ?? 0,
  }));
  const totalVotes = optionRows.reduce((sum, option) => sum + option.count, 0);

  let mine: string | null = null;
  if (visitor) {
    const vote = await prisma.pollVote.findUnique({
      where: { pollId_visitorId: { pollId, visitorId: visitor } },
      select: { optionId: true },
    });
    mine = vote?.optionId ?? null;
  }

  return {
    id: poll.id,
    question: poll.question,
    description: poll.description,
    totalVotes,
    options: buildPollPercents(optionRows, totalVotes),
    mine,
    closed,
    showResults: poll.showResults,
  };
}

export async function getPollStateAction(pollId: string): Promise<PollState> {
  if (!pollId.trim()) return emptyPollState();
  const visitor = await visitorId(false);
  try {
    const state = await loadPollState(pollId, visitor);
    return state ?? emptyPollState();
  } catch {
    return emptyPollState();
  }
}

export async function castPollVoteAction(
  pollId: string,
  optionId: string,
): Promise<PollState | { error: string }> {
  if (!pollId.trim() || !optionId.trim()) return { error: "Geçersiz anket." };

  const h = await headers();
  const ip = clientIp(h);
  const limited = rateLimit(`poll:${ip}`, { limit: 30, windowMs: 15 * 60_000 });
  if (!limited.ok) return { error: "Çok fazla deneme. Lütfen biraz bekleyin." };

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: { options: { select: { id: true } } },
  });
  if (!poll || !poll.active) return { error: "Anket bulunamadı." };
  if (!isPollOpen(poll.endsAt, poll.active)) return { error: "Anket sona erdi." };
  if (!poll.options.some((option) => option.id === optionId)) {
    return { error: "Geçersiz seçenek." };
  }

  const visitor = await visitorId(true);
  if (!visitor) return { error: "Oy kaydedilemedi." };

  const existing = await prisma.pollVote.findUnique({
    where: { pollId_visitorId: { pollId, visitorId: visitor } },
    select: { optionId: true },
  });

  if (existing?.optionId === optionId) {
    return { error: "Bu seçeneği zaten işaretlediniz." };
  }

  if (existing) {
    await prisma.pollVote.update({
      where: { pollId_visitorId: { pollId, visitorId: visitor } },
      data: { optionId },
    });
  } else {
    await prisma.pollVote.create({
      data: { pollId, optionId, visitorId: visitor },
    });
  }

  const state = await loadPollState(pollId, visitor);
  return state ?? emptyPollState();
}

export async function getActiveHomepagePoll() {
  const now = new Date();
  return prisma.poll.findFirst({
    where: {
      active: true,
      articleId: null,
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
}

export async function getArticlePoll(articleId: string) {
  const now = new Date();
  return prisma.poll.findFirst({
    where: {
      active: true,
      articleId,
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
}

export async function getPollStateForServer(pollId: string) {
  return getPollStateAction(pollId);
}
