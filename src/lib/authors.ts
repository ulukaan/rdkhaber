import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { articleSummarySelect } from "@/lib/articles";
import { authorHref } from "@/lib/author-path";

export { authorHref } from "@/lib/author-path";

export async function uniqueAuthorSlug(name: string, excludeId?: string) {
  const root = slugify(name) || `yazar-${Date.now().toString(36)}`;
  let candidate = root;
  let n = 2;
  while (true) {
    const existing = await prisma.user.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${root}-${n}`;
    n += 1;
  }
}

export async function ensureUserSlug(userId: string, name: string, currentSlug?: string | null) {
  if (currentSlug?.trim()) return currentSlug.trim();
  const slug = await uniqueAuthorSlug(name, userId);
  await prisma.user.update({ where: { id: userId }, data: { slug } });
  return slug;
}

const authorPublicSelect = {
  id: true,
  name: true,
  slug: true,
  avatarUrl: true,
  bio: true,
  role: true,
} as const;

export async function getAuthorBySlug(slug: string) {
  const author = await prisma.user.findFirst({
    where: {
      slug,
      active: true,
      role: { in: ["ADMIN", "EDITOR"] },
    },
    select: authorPublicSelect,
  });
  return author;
}

export async function getAuthorArticles(authorId: string, take = 24, skip = 0) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED", authorId },
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    select: articleSummarySelect,
  });
}

export async function countAuthorArticles(authorId: string) {
  return prisma.article.count({
    where: { status: "PUBLISHED", authorId },
  });
}

/** Editör / yönetici yazarlar — en az bir yayında haberi olanlar */
export async function getPublicAuthors() {
  const authors = await prisma.user.findMany({
    where: {
      active: true,
      role: { in: ["ADMIN", "EDITOR"] },
      articles: { some: { status: "PUBLISHED" } },
    },
    orderBy: { name: "asc" },
    select: {
      ...authorPublicSelect,
      _count: { select: { articles: { where: { status: "PUBLISHED" } } } },
    },
  });

  // Eksik slug'ları üret
  for (const author of authors) {
    if (!author.slug) {
      author.slug = await ensureUserSlug(author.id, author.name, author.slug);
    }
  }

  return authors;
}
