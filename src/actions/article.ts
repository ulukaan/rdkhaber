"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/slug";
import { prisma } from "@/lib/prisma";
import { articleSchema, headlineDesignSchema } from "@/lib/validation";
import { categoryHref } from "@/lib/category-path";
import { requireRole } from "@/lib/auth-guard";
import { sanitizeArticleHtml } from "@/lib/article-html";

async function revalidateArticlePaths(opts: {
  slug: string;
  categoryId?: string | null;
  previousCategoryId?: string | null;
}) {
  revalidatePath("/");
  revalidatePath(`/haber/${opts.slug}`);
  revalidatePath("/admin/makaleler");
  revalidatePath("/editor/makaleler");

  const categoryIds = [opts.categoryId, opts.previousCategoryId].filter(
    (id): id is string => Boolean(id),
  );
  if (categoryIds.length === 0) return;

  const categories = await prisma.category.findMany({
    where: { id: { in: [...new Set(categoryIds)] } },
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

function articleFields(data: ReturnType<typeof articleSchema.parse>, publishedAt: Date | null) {
  return {
    title: data.title,
    summary: data.summary,
    content: sanitizeArticleHtml(data.content),
    coverImageUrl: emptyToNull(data.coverImageUrl),
    videoUrl: emptyToNull(data.videoUrl),
    videoEmbed: emptyToNull(data.videoEmbed),
    categoryId: data.categoryId,
    status: data.status,
    isBreaking: data.isBreaking,
    isFeatured: data.isFeatured,
    inSpotlight: data.inSpotlight,
    inFiveHeadline: data.inFiveHeadline,
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
    publishedAt,
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
  const slug = slugify(data.slug || data.title);

  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) {
    return { error: "Bu slug zaten kullanılıyor." };
  }

  const publishedAt = parsePublishedAt(data.publishedAt, data.status, null);

  const article = await prisma.article.create({
    data: {
      ...articleFields(data, publishedAt),
      slug,
      authorId: session.user.id,
      tags: { connect: await resolveTags(parseTagNames(data.tagNames)) },
    },
  });

  await syncGalleryImages(article.id, data.galleryImages);

  const base = session.user.role === "ADMIN" ? "/admin" : "/editor";
  await revalidateArticlePaths({ slug, categoryId: data.categoryId });
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
  const slug = slugify(data.slug || data.title);

  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    return { error: "Bu slug zaten kullanılıyor." };
  }

  const current = await prisma.article.findUnique({ where: { id } });
  if (!current) return { error: "Haber bulunamadı." };

  const publishedAt = parsePublishedAt(data.publishedAt, data.status, current.publishedAt);

  await prisma.article.update({
    where: { id },
    data: {
      ...articleFields(data, publishedAt),
      slug,
      tags: { set: [], connect: await resolveTags(parseTagNames(data.tagNames)) },
    },
  });

  await syncGalleryImages(id, data.galleryImages);

  const base = session.user.role === "ADMIN" ? "/admin" : "/editor";
  await revalidateArticlePaths({
    slug,
    categoryId: data.categoryId,
    previousCategoryId: current.categoryId,
  });
  redirect(`${base}/makaleler/${id}/basarili?islem=duzenlendi`);
}

export async function saveHeadlineDesignAction(
  id: string,
  raw: Record<string, unknown>,
) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
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

  revalidatePath("/");
  revalidatePath("/admin/manset");
  revalidatePath("/editor/manset");
  redirect(`${session.user.role === "ADMIN" ? "/admin" : "/editor"}/manset`);
}

export async function updateArticleCategoryAction(id: string, categoryId: string) {
  await requireRole(["ADMIN", "EDITOR"]);
  if (!categoryId.trim()) return { error: "Kategori seçin." };

  const [article, category] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      select: { slug: true, categoryId: true },
    }),
    prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } }),
  ]);
  if (!article) return { error: "Haber bulunamadı." };
  if (!category) return { error: "Kategori bulunamadı." };
  if (article.categoryId === categoryId) return { success: true as const };

  await prisma.article.update({
    where: { id },
    data: { categoryId },
  });

  await revalidateArticlePaths({
    slug: article.slug,
    categoryId,
    previousCategoryId: article.categoryId,
  });
  return { success: true as const };
}

export async function deleteArticleAction(id: string) {
  await requireRole(["ADMIN", "EDITOR"]);
  const article = await prisma.article.findUnique({
    where: { id },
    select: { slug: true, categoryId: true },
  });
  if (!article) return;
  await prisma.article.delete({ where: { id } });
  await revalidateArticlePaths({
    slug: article.slug,
    categoryId: article.categoryId,
  });
}

export async function refreshArticleCacheAction(slug: string) {
  await requireRole(["ADMIN", "EDITOR"]);
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { categoryId: true },
  });
  await revalidateArticlePaths({
    slug,
    categoryId: article?.categoryId,
  });
  return { success: true as const };
}
