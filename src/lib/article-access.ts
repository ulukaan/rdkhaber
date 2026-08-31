import { prisma } from "@/lib/prisma";

type AppSession = {
  user: { id: string; role: "ADMIN" | "EDITOR" | "USER" };
};

type ArticleRef = {
  id: string;
  authorId: string;
  slug: string;
  categoryId: string;
};

export function canEditArticle(session: AppSession, article: { authorId: string }) {
  if (session.user.role === "ADMIN") return true;
  if (session.user.role === "EDITOR") return article.authorId === session.user.id;
  return false;
}

export async function getEditableArticle(
  session: AppSession,
  articleId: string,
): Promise<ArticleRef | null> {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true, authorId: true, slug: true, categoryId: true },
  });
  if (!article || !canEditArticle(session, article)) return null;
  return article;
}
