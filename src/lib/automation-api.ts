import { NextRequest, NextResponse } from "next/server";
import { ArticleStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyN8nSecret } from "@/lib/security-tokens";
import { slugify } from "@/lib/slug";
import { sanitizeArticleHtml } from "@/lib/article-html";
import { revalidatePublicSite } from "@/lib/revalidate-site";
import { writeAuditLog } from "@/lib/audit-log";

export function automationUnauthorized() {
  return NextResponse.json(
    { ok: false, error: "Yetkisiz. Authorization: Bearer <N8N_API_KEY> veya x-api-key gerekli." },
    { status: 401 },
  );
}

export function assertAutomationAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const secretHeader =
    request.headers.get("x-n8n-secret") ||
    request.headers.get("x-api-key") ||
    request.headers.get("x-automation-key");
  return verifyN8nSecret(authHeader) || verifyN8nSecret(secretHeader);
}

export function jsonOk<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

export function jsonError(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function resolveAutomationAuthor(customAuthorId?: string | null) {
  if (customAuthorId?.trim()) {
    const user = await prisma.user.findFirst({
      where: { id: customAuthorId.trim(), role: { in: ["ADMIN", "EDITOR"] }, active: true },
      select: { id: true, name: true, email: true },
    });
    if (!user) throw new Error("authorId geçersiz veya aktif personel değil.");
    return user;
  }
  const defaultUser = await prisma.user.findFirst({
    where: { role: { in: ["ADMIN", "EDITOR"] }, active: true },
    select: { id: true, name: true, email: true },
    orderBy: { createdAt: "asc" },
  });
  if (!defaultUser) throw new Error("Aktif yazar/admin bulunamadı.");
  return defaultUser;
}

export async function resolveCategory(input: {
  categoryId?: string | null;
  categorySlug?: string | null;
  categoryName?: string | null;
}) {
  if (input.categoryId?.trim()) {
    const byId = await prisma.category.findUnique({ where: { id: input.categoryId.trim() } });
    if (byId) return byId;
  }
  if (input.categorySlug?.trim()) {
    const bySlug = await prisma.category.findUnique({ where: { slug: input.categorySlug.trim() } });
    if (bySlug) return bySlug;
  }
  if (input.categoryName?.trim()) {
    const byName = await prisma.category.findFirst({
      where: { name: { contains: input.categoryName.trim() } },
    });
    if (byName) return byName;
  }
  return prisma.category.findFirst({ orderBy: { order: "asc" } });
}

export async function uniqueArticleSlug(baseTitle: string, excludeId?: string) {
  let base = slugify(baseTitle);
  if (!base) base = `haber-${Date.now()}`;
  let finalSlug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.article.findUnique({
      where: { slug: finalSlug },
      select: { id: true },
    });
    if (!existing || (excludeId && existing.id === excludeId)) break;
    finalSlug = `${base}-${counter}`;
    counter += 1;
  }
  return finalSlug;
}

export async function upsertTags(tags: unknown) {
  if (!Array.isArray(tags)) return [] as { id: string }[];
  const rows: { id: string }[] = [];
  for (const raw of tags) {
    const name = String(raw ?? "").trim();
    const tagSlug = slugify(name);
    if (!tagSlug) continue;
    const tag = await prisma.tag.upsert({
      where: { slug: tagSlug },
      create: { name, slug: tagSlug },
      update: {},
      select: { id: true },
    });
    rows.push(tag);
  }
  return rows;
}

export function parseArticleStatus(raw: unknown, fallback: ArticleStatus = ArticleStatus.DRAFT) {
  const value = String(raw ?? fallback).toUpperCase();
  if (value === "PUBLISHED") return ArticleStatus.PUBLISHED;
  if (value === "REVIEW") return ArticleStatus.REVIEW;
  if (value === "ARCHIVED") return ArticleStatus.ARCHIVED;
  if (value === "DRAFT") return ArticleStatus.DRAFT;
  return fallback;
}

export const articleSelect = {
  id: true,
  title: true,
  slug: true,
  summary: true,
  status: true,
  coverImageUrl: true,
  isBreaking: true,
  isFeatured: true,
  inSpotlight: true,
  inFiveHeadline: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  sourceName: true,
  sourceUrl: true,
  category: { select: { id: true, name: true, slug: true, color: true } },
  author: { select: { id: true, name: true, email: true } },
  tags: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ArticleSelect;

export type AutomationArticleInput = {
  title: string;
  content: string;
  summary?: string | null;
  slug?: string | null;
  coverImageUrl?: string | null;
  categoryId?: string | null;
  categorySlug?: string | null;
  categoryName?: string | null;
  tags?: unknown;
  status?: unknown;
  isBreaking?: boolean;
  isFeatured?: boolean;
  inSpotlight?: boolean;
  inFiveHeadline?: boolean;
  sourceName?: string | null;
  sourceUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  reporterName?: string | null;
  authorId?: string | null;
  publishedAt?: string | null;
};

export async function createAutomationArticle(input: AutomationArticleInput) {
  const title = input.title?.trim();
  const content = input.content?.trim();
  if (!title || !content) throw new Error("'title' ve 'content' zorunludur.");

  const author = await resolveAutomationAuthor(input.authorId);
  const category = await resolveCategory(input);
  if (!category) throw new Error("Kategori bulunamadı.");

  const status = parseArticleStatus(input.status, ArticleStatus.PUBLISHED);
  const slug = input.slug?.trim()
    ? await uniqueArticleSlug(input.slug.trim())
    : await uniqueArticleSlug(title);
  const tags = await upsertTags(input.tags);
  const publishedAt =
    status === ArticleStatus.PUBLISHED
      ? input.publishedAt
        ? new Date(input.publishedAt)
        : new Date()
      : null;

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      summary: (input.summary || title).trim(),
      content: sanitizeArticleHtml(content),
      coverImageUrl: input.coverImageUrl?.trim() || null,
      status,
      isBreaking: Boolean(input.isBreaking),
      isFeatured: Boolean(input.isFeatured),
      inSpotlight: Boolean(input.inSpotlight),
      inFiveHeadline: Boolean(input.inFiveHeadline),
      sourceName: input.sourceName?.trim() || "Otomasyon",
      sourceUrl: input.sourceUrl?.trim() || null,
      seoTitle: input.seoTitle?.trim() || title,
      seoDescription: input.seoDescription?.trim() || input.summary || title,
      seoKeywords: Array.isArray(input.tags)
        ? input.tags.map(String).join(", ")
        : input.seoKeywords?.trim() || null,
      reporterName: input.reporterName?.trim() || null,
      publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
      authorId: author.id,
      categoryId: category.id,
      tags: { connect: tags.map((t) => ({ id: t.id })) },
      extraCategories: { create: { categoryId: category.id } },
    },
    select: articleSelect,
  });

  await writeAuditLog({
    action: "automation.create_article",
    entity: "Article",
    entityId: article.id,
    meta: { title: article.title, slug: article.slug, status: article.status },
  });
  revalidatePublicSite();
  return article;
}

export async function updateAutomationArticle(id: string, input: Partial<AutomationArticleInput>) {
  const existing = await prisma.article.findUnique({ where: { id }, select: { id: true, slug: true, status: true, publishedAt: true } });
  if (!existing) throw new Error("Haber bulunamadı.");

  const data: Prisma.ArticleUpdateInput = {};
  if (input.title?.trim()) data.title = input.title.trim();
  if (input.content?.trim()) data.content = sanitizeArticleHtml(input.content.trim());
  if (input.summary !== undefined) data.summary = (input.summary || input.title || "").trim() || undefined;
  if (input.coverImageUrl !== undefined) data.coverImageUrl = input.coverImageUrl?.trim() || null;
  if (input.sourceName !== undefined) data.sourceName = input.sourceName?.trim() || null;
  if (input.sourceUrl !== undefined) data.sourceUrl = input.sourceUrl?.trim() || null;
  if (input.seoTitle !== undefined) data.seoTitle = input.seoTitle?.trim() || null;
  if (input.seoDescription !== undefined) data.seoDescription = input.seoDescription?.trim() || null;
  if (input.seoKeywords !== undefined) data.seoKeywords = input.seoKeywords?.trim() || null;
  if (input.reporterName !== undefined) data.reporterName = input.reporterName?.trim() || null;
  if (input.isBreaking !== undefined) data.isBreaking = Boolean(input.isBreaking);
  if (input.isFeatured !== undefined) data.isFeatured = Boolean(input.isFeatured);
  if (input.inSpotlight !== undefined) data.inSpotlight = Boolean(input.inSpotlight);
  if (input.inFiveHeadline !== undefined) data.inFiveHeadline = Boolean(input.inFiveHeadline);

  if (input.slug?.trim()) {
    data.slug = await uniqueArticleSlug(input.slug.trim(), id);
  }

  if (input.status !== undefined) {
    const status = parseArticleStatus(input.status, existing.status);
    data.status = status;
    if (status === ArticleStatus.PUBLISHED && !existing.publishedAt) {
      data.publishedAt = input.publishedAt ? new Date(input.publishedAt) : new Date();
    }
  } else if (input.publishedAt) {
    const date = new Date(input.publishedAt);
    if (!Number.isNaN(date.getTime())) data.publishedAt = date;
  }

  if (input.categoryId || input.categorySlug || input.categoryName) {
    const category = await resolveCategory(input);
    if (!category) throw new Error("Kategori bulunamadı.");
    data.category = { connect: { id: category.id } };
  }

  if (input.authorId) {
    const author = await resolveAutomationAuthor(input.authorId);
    data.author = { connect: { id: author.id } };
  }

  if (input.tags !== undefined) {
    const tags = await upsertTags(input.tags);
    data.tags = { set: tags.map((t) => ({ id: t.id })) };
  }

  const article = await prisma.article.update({
    where: { id },
    data,
    select: articleSelect,
  });

  await writeAuditLog({
    action: "automation.update_article",
    entity: "Article",
    entityId: article.id,
    meta: { title: article.title, slug: article.slug, status: article.status },
  });
  revalidatePublicSite();
  return article;
}

export function publicArticleUrl(slug: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://duzceradikal.com";
  return `${base}/haber/${slug}`;
}

export function withArticleUrls<T extends { slug: string }>(article: T) {
  return {
    ...article,
    url: `/haber/${article.slug}`,
    absoluteUrl: publicArticleUrl(article.slug),
  };
}
