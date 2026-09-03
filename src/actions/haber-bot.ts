"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { haberBotSourceSchema, haberBotWordSchema } from "@/lib/validation";
import { parseWordTemplate } from "@/lib/haber-bot/words";
import { runAllHaberBotSources, runHaberBotSource } from "@/lib/haber-bot/import";
import { normalizeSourceUrlSafe } from "@/lib/haber-bot/feed";
import { revalidatePublicSite } from "@/lib/revalidate-site";

function refresh() {
  revalidatePath("/admin/haber-botu");
  revalidatePath("/admin/makaleler");
  revalidatePath("/editor/makaleler");
  revalidatePublicSite();
}

export async function createHaberBotSourceAction(raw: Record<string, unknown>) {
  await requireRole(["ADMIN"]);
  const parsed = haberBotSourceSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  let url: string;
  try {
    url = await normalizeSourceUrlSafe(parsed.data.url);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Geçerli bir site adresi girin (ör. https://ornek.com)",
    };
  }

  const existing = await prisma.haberBotSource.findUnique({ where: { url } });
  if (existing) return { error: "Bu site zaten ekli." };

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) return { error: "Kategori bulunamadı." };

  await prisma.haberBotSource.create({
    data: {
      name: parsed.data.name.trim(),
      url,
      categoryId: parsed.data.categoryId,
      maxItems: parsed.data.maxItems,
      importStatus: parsed.data.importStatus,
    },
  });
  refresh();
  return { success: true };
}

export async function deleteHaberBotSourceAction(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.haberBotSource.delete({ where: { id } });
  refresh();
}

export async function toggleHaberBotSourceAction(id: string) {
  await requireRole(["ADMIN"]);
  const source = await prisma.haberBotSource.findUnique({ where: { id } });
  if (!source) return { error: "Kaynak bulunamadı." };
  await prisma.haberBotSource.update({
    where: { id },
    data: { enabled: !source.enabled },
  });
  refresh();
}

export async function createHaberBotWordAction(raw: Record<string, unknown>) {
  await requireRole(["ADMIN"]);
  const parsed = haberBotWordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const find = parsed.data.find.trim();
  const replace = parsed.data.replace;
  const existing = await prisma.haberBotWord.findUnique({ where: { find } });
  if (existing) {
    await prisma.haberBotWord.update({
      where: { id: existing.id },
      data: { replace, active: true },
    });
  } else {
    const last = await prisma.haberBotWord.aggregate({ _max: { order: true } });
    await prisma.haberBotWord.create({
      data: { find, replace, order: (last._max.order ?? 0) + 1 },
    });
  }
  refresh();
  return { success: true };
}

export async function importHaberBotWordsAction(template: string) {
  await requireRole(["ADMIN"]);
  const pairs = parseWordTemplate(template);
  if (pairs.length === 0) {
    return { error: "Kalıpta geçerli satır yok. Örnek: abartı => mübalağa" };
  }

  const last = await prisma.haberBotWord.aggregate({ _max: { order: true } });
  let order = last._max.order ?? 0;
  let added = 0;

  for (const pair of pairs) {
    const existing = await prisma.haberBotWord.findUnique({ where: { find: pair.find } });
    if (existing) {
      await prisma.haberBotWord.update({
        where: { id: existing.id },
        data: { replace: pair.replace, active: true },
      });
    } else {
      order += 1;
      await prisma.haberBotWord.create({
        data: { find: pair.find, replace: pair.replace, order },
      });
      added += 1;
    }
  }

  refresh();
  return { success: true, added, total: pairs.length };
}

export async function deleteHaberBotWordAction(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.haberBotWord.delete({ where: { id } });
  refresh();
}

export async function toggleHaberBotWordAction(id: string) {
  await requireRole(["ADMIN"]);
  const word = await prisma.haberBotWord.findUnique({ where: { id } });
  if (!word) return { error: "Kayıt bulunamadı." };
  await prisma.haberBotWord.update({
    where: { id },
    data: { active: !word.active },
  });
  refresh();
}

export async function fetchHaberBotSourceAction(id: string) {
  const session = await requireRole(["ADMIN"]);
  const result = await runHaberBotSource(id, session.user.id);
  refresh();
  return result;
}

export async function fetchAllHaberBotSourcesAction() {
  const session = await requireRole(["ADMIN"]);
  const result = await runAllHaberBotSources(session.user.id);
  refresh();
  return result;
}

async function deleteLogsAndArticles(ids: string[]) {
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (unique.length === 0) return { logs: 0, articles: 0 };

  const logs = await prisma.haberBotLog.findMany({
    where: { id: { in: unique } },
    select: { id: true, articleId: true },
  });
  const articleIds = [...new Set(logs.map((l) => l.articleId).filter((id): id is string => Boolean(id)))];

  if (articleIds.length > 0) {
    await prisma.article.deleteMany({ where: { id: { in: articleIds } } });
  }
  await prisma.haberBotLog.deleteMany({ where: { id: { in: logs.map((l) => l.id) } } });
  return { logs: logs.length, articles: articleIds.length };
}

export async function deleteHaberBotLogAction(id: string) {
  await requireRole(["ADMIN"]);
  await deleteLogsAndArticles([id]);
  refresh();
}

export async function deleteHaberBotLogsAction(ids: string[]) {
  await requireRole(["ADMIN"]);
  if (!Array.isArray(ids) || ids.length === 0) return { error: "Kayıt seçin." };
  await deleteLogsAndArticles(ids);
  refresh();
}

export async function clearHaberBotLogsAction() {
  await requireRole(["ADMIN"]);
  const logs = await prisma.haberBotLog.findMany({ select: { id: true, articleId: true } });
  await deleteLogsAndArticles(logs.map((l) => l.id));
  refresh();
}
