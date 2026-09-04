import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { articleSummarySelect } from "@/lib/articles";

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

/** Aktif editör / yönetici yazarlar — haber olmasa da listelenir */
export async function getPublicAuthors() {
  const authors = await prisma.user.findMany({
    where: {
      active: true,
      role: { in: ["ADMIN", "EDITOR"] },
    },
    orderBy: { name: "asc" },
    select: {
      ...authorPublicSelect,
      _count: { select: { articles: { where: { status: "PUBLISHED" } } } },
      articles: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 1,
        select: { id: true, title: true, slug: true, publishedAt: true },
      },
    },
  });

  for (const author of authors) {
    if (!author.slug) {
      author.slug = await ensureUserSlug(author.id, author.name, author.slug);
    }
  }

  return authors.map((author) => ({
    ...author,
    latestArticle: author.articles[0] ?? null,
    articles: undefined,
  }));
}

export type AuthorWithLatestArticle = {
  author: {
    id: string;
    name: string;
    slug: string | null;
    avatarUrl: string | null;
    bio: string | null;
    role: "ADMIN" | "EDITOR" | "USER";
  };
  article: {
    id: string;
    title: string;
    slug: string;
    publishedAt: Date | null;
  };
};

/**
 * Anasayfa Yazarlar — her yazardan en fazla 1 kart (son yayını).
 * Aynı editörün 5 haberi peş peşe gelmesin diye yazar bazında tekilleştirir.
 */
export async function getAuthorsWithLatestArticle(take = 5): Promise<AuthorWithLatestArticle[]> {
  const authors = await prisma.user.findMany({
    where: {
      active: true,
      role: { in: ["ADMIN", "EDITOR"] },
      articles: { some: { status: "PUBLISHED" } },
    },
    select: {
      ...authorPublicSelect,
      articles: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 1,
        select: { id: true, title: true, slug: true, publishedAt: true },
      },
    },
  });

  const rows: AuthorWithLatestArticle[] = [];
  for (const author of authors) {
    const article = author.articles[0];
    if (!article) continue;
    let slug = author.slug;
    if (!slug) slug = await ensureUserSlug(author.id, author.name, author.slug);
    rows.push({
      author: {
        id: author.id,
        name: author.name,
        slug,
        avatarUrl: author.avatarUrl,
        bio: author.bio,
        role: author.role,
      },
      article,
    });
  }

  rows.sort((a, b) => {
    const aTime = a.article.publishedAt?.getTime() ?? 0;
    const bTime = b.article.publishedAt?.getTime() ?? 0;
    return bTime - aTime;
  });

  return rows.slice(0, take);
}
