import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { sanitizeArticleHtml } from "@/lib/article-html";
import { revalidatePublicSite } from "@/lib/revalidate-site";
import { revalidatePath } from "next/cache";
import {
  haberWriteSchema,
  mapHaberDurum,
  type HaberWriteInput,
} from "@/lib/haber-write-schema";
import { onArticlePublished } from "@/lib/article-publish-hooks";
import { writeAuditLog } from "@/lib/audit-log";

async function uniqueSlug(base: string) {
  const root = slugify(base) || `haber-${Date.now().toString(36)}`;
  let slug = root;
  let n = 2;
  while (await prisma.article.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}

/** Düz metni güvenli HTML paragraflarına çevirir; HTML gelirse sanitize eder. */
export function normalizeArticleContent(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return sanitizeArticleHtml(trimmed);
  }
  const paragraphs = trimmed
    .split(/\n{2,}/)
    .map((p) => p.trim().replace(/\n/g, "<br />"))
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join("");
  return sanitizeArticleHtml(paragraphs);
}

async function resolveCategoryId(raw: string) {
  const q = raw.trim();
  if (!q) return null;

  const bySlug = await prisma.category.findFirst({
    where: { slug: slugify(q) },
    select: { id: true, slug: true, name: true },
  });
  if (bySlug) return bySlug;

  const byName = await prisma.category.findFirst({
    where: { name: { equals: q } },
    select: { id: true, slug: true, name: true },
  });
  if (byName) return byName;

  const loose = await prisma.category.findFirst({
    where: { name: { contains: q } },
    select: { id: true, slug: true, name: true },
    orderBy: { name: "asc" },
  });
  return loose;
}

async function resolveTags(names: string[]) {
  const cleaned = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  const tags = await Promise.all(
    cleaned.map((name) =>
      prisma.tag.upsert({
        where: { slug: slugify(name) || `etiket-${Date.now().toString(36)}` },
        update: {},
        create: { name, slug: slugify(name) || `etiket-${Date.now().toString(36)}` },
      }),
    ),
  );
  return tags.map((t) => ({ id: t.id }));
}

async function defaultAuthorId() {
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN", active: true },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  return admin?.id ?? null;
}

export type CreateHaberFromApiResult =
  | {
      ok: true;
      article: {
        id: string;
        title: string;
        slug: string;
        status: ArticleStatus;
        category: { id: string; name: string; slug: string };
        adminUrl: string;
        publicUrl: string | null;
      };
    }
  | { ok: false; error: string; status: number };

export async function createHaberFromApi(
  raw: unknown,
): Promise<CreateHaberFromApiResult> {
  const parsed = haberWriteSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Geçersiz istek gövdesi",
      status: 400,
    };
  }

  const data: HaberWriteInput = parsed.data;
  const title = (data.baslik ?? data.title)!.trim();
  const summary = (data.spot ?? data.summary)!.trim();
  const contentRaw = (data.icerik ?? data.content)!.trim();
  const categoryRaw = (data.kategori ?? data.category)!.trim();
  const tagNames = data.etiketler ?? data.tags ?? [];
  const status = mapHaberDurum(data.durum ?? data.status);
  const coverImageUrl = (data.kapak_gorseli || data.coverImageUrl || "").trim() || null;
  const reporterName = (data.muhabir || data.reporterName || "").trim() || null;
  const sourceName = (data.kaynak || data.sourceName || "").trim() || null;
  const sourceUrl = (data.kaynak_url || data.sourceUrl || "").trim() || null;

  const category = await resolveCategoryId(categoryRaw);
  if (!category) {
    return {
      ok: false,
      error: `Kategori bulunamadı: "${categoryRaw}". Slug veya tam ad kullanın (ör. gundem, Düzce).`,
      status: 400,
    };
  }

  const authorId = await defaultAuthorId();
  if (!authorId) {
    return { ok: false, error: "Aktif admin yazar bulunamadı", status: 500 };
  }

  const slug = await uniqueSlug(data.slug?.trim() || title);
  const content = normalizeArticleContent(contentRaw);
  if (content.length < 20) {
    return { ok: false, error: "İçerik sanitize sonrası çok kısa", status: 400 };
  }

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      summary,
      content,
      coverImageUrl,
      categoryId: category.id,
      authorId,
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      reporterName,
      sourceName,
      sourceUrl,
      tags: { connect: await resolveTags(tagNames) },
      extraCategories: { create: [{ categoryId: category.id }] },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
      isBreaking: true,
      summary: true,
      content: true,
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  if (status === "PUBLISHED") {
    await onArticlePublished(
      {
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        content: article.content,
        isBreaking: article.isBreaking,
        publishedAt: article.publishedAt,
      },
      { wasPublished: false },
    );
  }

  await writeAuditLog({
    action: "api.haber.create",
    meta: {
      articleId: article.id,
      slug: article.slug,
      status: article.status,
      category: category.slug,
    },
  });

  revalidatePublicSite();
  revalidatePath("/admin/makaleler");
  revalidatePath(`/haber/${article.slug}`);

  return {
    ok: true,
    article: {
      id: article.id,
      title: article.title,
      slug: article.slug,
      status: article.status,
      category: article.category,
      adminUrl: `/admin/makaleler/${article.id}`,
      publicUrl: status === "PUBLISHED" ? `/haber/${article.slug}` : null,
    },
  };
}
