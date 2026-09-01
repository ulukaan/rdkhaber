import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

/** Takip edilen yazar yeni haber yayınladığında takipçilere bildirim. */
export async function notifyAuthorFollowers(article: {
  title: string;
  slug: string;
  authorId: string;
  authorName: string;
}) {
  const followers = await prisma.authorFollow.findMany({
    where: { authorId: article.authorId },
    select: { followerId: true },
  });
  if (followers.length === 0) return;

  await Promise.all(
    followers.map((row) =>
      createNotification({
        userId: row.followerId,
        title: `${article.authorName} yeni yazı paylaştı`,
        body: article.title,
        href: `/haber/${article.slug}`,
      }),
    ),
  );
}

/** Yorum onaylandığında yazara bildirim. */
export async function notifyCommentApproved(commentId: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      userId: true,
      content: true,
      article: { select: { title: true, slug: true } },
    },
  });
  if (!comment?.userId) return;

  const preview = comment.content.trim().slice(0, 120);
  await createNotification({
    userId: comment.userId,
    title: "Yorumunuz yayınlandı",
    body: `"${comment.article.title}" haberindeki yorumunuz onaylandı: ${preview}${comment.content.length > 120 ? "…" : ""}`,
    href: `/haber/${comment.article.slug}#comments-heading`,
  });
}
