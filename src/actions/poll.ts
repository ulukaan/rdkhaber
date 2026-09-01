"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { pollSchema } from "@/lib/validation";
import { requireRole } from "@/lib/auth-guard";
import { revalidatePublicSite } from "@/lib/revalidate-site";

function parseEndsAt(raw: string | undefined) {
  const value = raw?.trim();
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

async function resolveArticleId(slug: string | undefined) {
  const trimmed = slug?.trim();
  if (!trimmed) return null;
  const article = await prisma.article.findFirst({
    where: { slug: trimmed },
    select: { id: true },
  });
  if (!article) throw new Error("Haber bulunamadı.");
  return article.id;
}

function revalidatePollPaths(articleId: string | null) {
  revalidatePath("/admin/anketler");
  revalidatePublicSite();
  if (articleId) {
    revalidatePath("/haber/[slug]", "page");
  } else {
    revalidatePath("/");
  }
}

export async function createPollAction(raw: unknown) {
  await requireRole(["ADMIN"]);
  const parsed = pollSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz veri." };
  }

  let articleId: string | null = null;
  try {
    articleId = await resolveArticleId(parsed.data.articleSlug);
  } catch {
    return { error: "Bağlanacak haber bulunamadı." };
  }

  const options = parsed.data.options.map((label) => label.trim()).filter(Boolean);
  if (options.length < 2) return { error: "En az 2 seçenek gerekli." };

  const poll = await prisma.poll.create({
    data: {
      question: parsed.data.question.trim(),
      description: parsed.data.description?.trim() || null,
      articleId,
      active: parsed.data.active,
      showResults: parsed.data.showResults,
      endsAt: parseEndsAt(parsed.data.endsAt),
      options: {
        create: options.map((label, order) => ({ label, order })),
      },
    },
    select: { id: true, articleId: true },
  });

  revalidatePollPaths(poll.articleId);
  return { success: true, id: poll.id };
}

export async function updatePollAction(id: string, raw: unknown) {
  await requireRole(["ADMIN"]);
  const parsed = pollSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz veri." };
  }

  const existing = await prisma.poll.findUnique({
    where: { id },
    select: { id: true, articleId: true },
  });
  if (!existing) return { error: "Anket bulunamadı." };

  let articleId: string | null = null;
  try {
    articleId = await resolveArticleId(parsed.data.articleSlug);
  } catch {
    return { error: "Bağlanacak haber bulunamadı." };
  }

  const options = parsed.data.options.map((label) => label.trim()).filter(Boolean);
  if (options.length < 2) return { error: "En az 2 seçenek gerekli." };

  await prisma.$transaction(async (tx) => {
    const existingOptions = await tx.pollOption.findMany({
      where: { pollId: id },
      orderBy: { order: "asc" },
    });

    await tx.poll.update({
      where: { id },
      data: {
        question: parsed.data.question.trim(),
        description: parsed.data.description?.trim() || null,
        articleId,
        active: parsed.data.active,
        showResults: parsed.data.showResults,
        endsAt: parseEndsAt(parsed.data.endsAt),
      },
    });

    for (let index = 0; index < options.length; index += 1) {
      const label = options[index];
      const existing = existingOptions[index];
      if (existing) {
        await tx.pollOption.update({
          where: { id: existing.id },
          data: { label, order: index },
        });
      } else {
        await tx.pollOption.create({
          data: { pollId: id, label, order: index },
        });
      }
    }

    const extra = existingOptions.slice(options.length);
    if (extra.length > 0) {
      await tx.pollOption.deleteMany({
        where: { id: { in: extra.map((option) => option.id) } },
      });
    }
  });

  revalidatePollPaths(articleId ?? existing.articleId);
  return { success: true };
}

export async function deletePollAction(id: string) {
  await requireRole(["ADMIN"]);
  const poll = await prisma.poll.findUnique({
    where: { id },
    select: { articleId: true },
  });
  if (!poll) return { error: "Anket bulunamadı." };

  await prisma.poll.delete({ where: { id } });
  revalidatePollPaths(poll.articleId);
  return { success: true };
}

export async function togglePollActiveAction(id: string, active: boolean) {
  await requireRole(["ADMIN"]);
  const poll = await prisma.poll.update({
    where: { id },
    data: { active },
    select: { articleId: true },
  });
  revalidatePollPaths(poll.articleId);
  return { success: true };
}
