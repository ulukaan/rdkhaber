"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/slug";
import { prisma } from "@/lib/prisma";
import { articleSchema, headlineDesignSchema } from "@/lib/validation";
import { categoryHref } from "@/lib/category-path";
import { requireRole } from "@/lib/auth-guard";
import { sanitizeArticleHtml } from "@/lib/article-html";
import { revalidatePublicSite } from "@/lib/revalidate-site";
import { getEditableArticle, canEditArticle } from "@/lib/article-access";
import { writeAuditLog } from "@/lib/audit-log";
import { getSettings } from "@/lib/settings";
import { resolveArticlePublishState, parseScheduledAt } from "@/lib/article-workflow";
import { onArticlePublished, onArticleBreakingEnabled } from "@/lib/article-publish-hooks";

function uniqueCategoryIds(data: { categoryId?: string; categoryIds?: string[] }) {
  const fromList = (data.categoryIds ?? []).map((id) => id.trim()).filter(Boolean);
  const fromSingle = data.categoryId?.trim();
  const ids = fromList.length > 0 ? fromList : fromSingle ? [fromSingle] : [];
  return [...new Set(ids)];
}

async function syncArticleCategories(articleId: string, categoryIds: string[]) {
  await prisma.articleCategory.deleteMany({ where: { articleId } });
  if (categoryIds.length === 0) return;
  await prisma.articleCategory.createMany({
    data: categoryIds.map((categoryId) => ({ articleId, categoryId })),
  });
}

async function revalidateArticlePaths(opts: {
  slug: string;
  categoryIds?: string[];
}) {
  revalidatePublicSite();
  revalidatePath(`/haber/${opts.slug}`);
  revalidatePath("/admin/makaleler");
  revalidatePath("/editor/makaleler");

  const categoryIds = [...new Set((opts.categoryIds ?? []).filter(Boolean))];
  if (categoryIds.length === 0) return;

  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { slug: true, parentId: true, parent: { select: { slug: true } } },
  });

  for (const cat of categories) {
    revalidatePath(categoryHref(cat.slug));
    revalidatePath(`/kategori/${cat.slug}`);
    if (cat.parent?.slug) {
      revalidatePath(categoryHref(cat.parent.slug));
      revalidatePath(`/kategori/${cat.parent.slug}`);
    }
  }
}

function parseTagNames(raw?: string) {
  return (raw ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function parseGalleryImages(raw: unknown) {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function emptyToNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parsePublishedAt(raw: string | undefined, status: string, fallback: Date | null) {
  if (raw?.trim()) {
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) return date;
  }
  if (status === "PUBLISHED") return fallback ?? new Date();
  return fallback;
}

async function resolvePublishFields(
  data: ReturnType<typeof articleSchema.parse>,
  session: { user: { id: string; role: import("@prisma/client").Role } },
  current: { publishedAt: Date | null; status: string } | null,
) {
  const settings = await getSettings();
  const scheduledAt = parseScheduledAt(data.scheduledAt);
  const manualPublishedAt = parsePublishedAt(data.publishedAt, data.status, current?.publishedAt ?? null);
  const resolution = resolveArticlePublishState({
    requestedStatus: data.status,
    scheduledAt,
    publishedAt: manualPublishedAt,
    role: session.user.role,
    editorRequiresApproval: settings.editorRequiresApproval === "1",
  });

  return {
    status: resolution.status,
    publishedAt: resolution.publishedAt,
    scheduledAt: resolution.scheduledAt,
    isLiveBlog: data.isLiveBlog,
    pendingApproval: resolution.pendingApproval,
  };
}

async function resolveTags(names: string[]) {
  const tags = await Promise.all(
    names.map((name) =>
      prisma.tag.upsert({
        where: { slug: slugify(name) },
        update: {},
        create: { name, slug: slugify(name) },
      }),
    ),
  );
  return tags.map((t) => ({ id: t.id }));
}

async function syncGalleryImages(
  articleId: string,
  images: Array<{ url: string; caption?: string }>,
) {
  await prisma.articleImage.deleteMany({ where: { articleId } });
  if (images.length === 0) return;
  await prisma.articleImage.createMany({
    data: images
      .filter((img) => img.url.trim())
      .map((img, order) => ({
        articleId,
        imageUrl: img.url.trim(),
        caption: img.caption?.trim() || null,
        order,
      })),
  });
}

function articleFields(
  data: ReturnType<typeof articleSchema.parse>,
  publish: { status: string; publishedAt: Date | null; scheduledAt: Date | null; isLiveBlog: boolean },
  primaryCategoryId: string,
) {
  return {
    title: data.title,
    summary: data.summary,
    content: sanitizeArticleHtml(data.content),
    coverImageUrl: emptyToNull(data.coverImageUrl),
    videoUrl: emptyToNull(data.videoUrl),
    videoEmbed: emptyToNull(data.videoEmbed),
    categoryId: primaryCategoryId,
    status: publish.status as import("@prisma/client").ArticleStatus,
    isBreaking: data.isBreaking,
    isFeatured: data.isFeatured,
    inSpotlight: data.inSpotlight,
    inFiveHeadline: data.inFiveHeadline,
    isLiveBlog: publish.isLiveBlog,
    imageMainHeadline: emptyToNull(data.imageMainHeadline),
    imageTopHeadline: emptyToNull(data.imageTopHeadline),
    imageSpotlight: emptyToNull(data.imageSpotlight),
    imageFiveHeadline: emptyToNull(data.imageFiveHeadline),
    imageSocial: emptyToNull(data.imageSocial),
    imageStory: emptyToNull(data.imageStory),
    reporterName: emptyToNull(data.reporterName),
    sourceName: emptyToNull(data.sourceName),
    sourceUrl: emptyToNull(data.sourceUrl),
    redirectUrl: emptyToNull(data.redirectUrl),
    seoTitle: emptyToNull(data.seoTitle),
    seoDescription: emptyToNull(data.seoDescription),
    seoKeywords: emptyToNull(data.seoKeywords),
    publishedAt: publish.publishedAt,
    scheduledAt: publish.scheduledAt,
  };
}

export async function createArticleAction(raw: Record<string, unknown>) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const parsed = articleSchema.safeParse({
    ...raw,
    galleryImages: parseGalleryImages(raw.galleryImages),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const data = parsed.data;
  const categoryIds = uniqueCategoryIds(data);
  if (categoryIds.length === 0) return { error: "En az bir kategori seçin." };
  const categoryCount = await prisma.category.count({ where: { id: { in: categoryIds } } });
  if (categoryCount !== categoryIds.length) return { error: "Geçersiz kategori." };
  const slug = slugify(data.slug || data.title);

  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) {
    return { error: "Bu slug zaten kullanılıyor." };
  }

  const publish = await resolvePublishFields(data, session, null);

  const article = await prisma.article.create({
    data: {
      ...articleFields(data, publish, categoryIds[0]),
      slug,
      authorId: session.user.id,
      tags: { connect: await resolveTags(parseTagNames(data.tagNames)) },
    },
  });

  await syncArticleCategories(article.id, categoryIds);
  await syncGalleryImages(article.id, data.galleryImages);

  if (publish.status === "PUBLISHED") {
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

  const base = session.user.role === "ADMIN" ? "/admin" : "/editor";
  await revalidateArticlePaths({ slug, categoryIds });
  redirect(`${base}/makaleler/${article.id}/basarili?islem=eklendi`);
}

export async function updateArticleAction(id: string, raw: Record<string, unknown>) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const parsed = articleSchema.safeParse({
    ...raw,
    galleryImages: parseGalleryImages(raw.galleryImages),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const data = parsed.data;
  const categoryIds = uniqueCategoryIds(data);
  if (categoryIds.length === 0) return { error: "En az bir kategori seçin." };
  const categoryCount = await prisma.category.count({ where: { id: { in: categoryIds } } });
  if (categoryCount !== categoryIds.length) return { error: "Geçersiz kategori." };
  const slug = slugify(data.slug || data.title);

  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    return { error: "Bu slug zaten kullanılıyor." };
  }

  const current = await prisma.article.findUnique({
    where: { id },
    include: { extraCategories: { select: { categoryId: true } } },
  });
  if (!current) return { error: "Haber bulunamadı." };
  if (!(await getEditableArticle(session, id))) {
    return { error: "Bu haberi düzenleme yetkiniz yok." };
  }

  const publish = await resolvePublishFields(data, session, current);
  const wasPublished = current.status === "PUBLISHED";

  await prisma.articleRevision.create({
    data: {
      articleId: id,
      userId: session.user.id,
      snapshot: JSON.stringify({
        title: current.title,
        slug: current.slug,
        status: current.status,
        summary: current.summary.slice(0, 500),
        updatedAt: current.updatedAt.toISOString(),
      }).slice(0, 50_000),
    },
  });

  const updated = await prisma.article.update({
    where: { id },
    data: {
      ...articleFields(data, publish, categoryIds[0]),
      slug,
      tags: { set: [], connect: await resolveTags(parseTagNames(data.tagNames)) },
    },
  });

  await syncArticleCategories(id, categoryIds);
  await syncGalleryImages(id, data.galleryImages);

  if (publish.status === "PUBLISHED" && !wasPublished) {
    await onArticlePublished(
      {
        id: updated.id,
        title: updated.title,
        slug: updated.slug,
        summary: updated.summary,
        content: updated.content,
        isBreaking: updated.isBreaking,
        publishedAt: updated.publishedAt,
      },
      { wasPublished },
    );
  } else if (
    publish.status === "PUBLISHED" &&
    wasPublished &&
    !current.isBreaking &&
    updated.isBreaking
  ) {
    await onArticleBreakingEnabled({ title: updated.title, slug: updated.slug });
  }

  await writeAuditLog({
    userId: session.user.id,
    action: "article.update",
    entity: "Article",
    entityId: id,
    meta: { slug, status: publish.status, pendingApproval: publish.pendingApproval },
  });

  const base = session.user.role === "ADMIN" ? "/admin" : "/editor";
  const previousIds = [current.categoryId, ...current.extraCategories.map((row) => row.categoryId)];
  await revalidateArticlePaths({
    slug,
    categoryIds: [...categoryIds, ...previousIds],
  });
  redirect(`${base}/makaleler/${id}/basarili?islem=duzenlendi`);
}

export async function saveHeadlineDesignAction(
  id: string,
  raw: Record<string, unknown>,
) {
  const session = await requireRole(["ADMIN"]);
  const parsed = headlineDesignSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const data = parsed.data;
  await prisma.article.update({
    where: { id },
    data: {
      headlineKicker: data.headlineKicker?.trim() || null,
      headlineTitle: data.headlineTitle.trim(),
      headlineSub: data.headlineSub?.trim() || null,
      headlineAlign: data.headlineAlign,
      headlineImageAlign: data.headlineImageAlign,
      isFeatured: true,
    },
  });

  revalidatePublicSite();
  revalidatePath("/admin/manset");
  revalidatePath("/editor/manset");
  redirect(`${session.user.role === "ADMIN" ? "/admin" : "/editor"}/manset`);
}

export async function updateArticleCategoryAction(id: string, categoryId: string) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  if (!categoryId.trim()) return { error: "Kategori seçin." };

  const article = await getEditableArticle(session, id);
  if (!article) return { error: "Haber bulunamadı veya yetkiniz yok." };

  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!category) return { error: "Kategori bulunamadı." };
  if (article.categoryId === categoryId) return { success: true as const };

  await prisma.article.update({
    where: { id },
    data: { categoryId },
  });
  await prisma.articleCategory.createMany({
    data: [
      { articleId: id, categoryId },
      { articleId: id, categoryId: article.categoryId },
    ],
    skipDuplicates: true,
  });

  await revalidateArticlePaths({
    slug: article.slug,
    categoryIds: [categoryId, article.categoryId],
  });
  return { success: true as const };
}

export async function deleteArticleAction(id: string) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const article = await getEditableArticle(session, id);
  if (!article) return;
  const extras = await prisma.articleCategory.findMany({
    where: { articleId: id },
    select: { categoryId: true },
  });
  await prisma.article.delete({ where: { id } });
  await revalidateArticlePaths({
    slug: article.slug,
    categoryIds: [article.categoryId, ...extras.map((row) => row.categoryId)],
  });
}

export async function refreshArticleCacheAction(slug: string) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const row = await prisma.article.findUnique({
    where: { slug },
    select: {
      id: true,
      authorId: true,
      categoryId: true,
      extraCategories: { select: { categoryId: true } },
    },
  });
  if (!row || !canEditArticle(session, row)) {
    return { error: "Haber bulunamadı veya yetkiniz yok." };
  }
  await revalidateArticlePaths({
    slug,
    categoryIds: [row.categoryId, ...row.extraCategories.map((x) => x.categoryId)],
  });
  return { success: true as const };
}
