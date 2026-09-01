import { prisma } from "@/lib/prisma";
import { sharePublishedArticle } from "@/lib/social-share";
import { sendBreakingNewsPush } from "@/lib/web-push";
import { indexArticleInMeilisearch } from "@/lib/search-index";
import { revalidatePublicSite } from "@/lib/revalidate-site";
import { notifyAdmins } from "@/lib/notifications";
import { notifyAuthorFollowers } from "@/lib/engagement-notify";
import { saveGeneratedSharePost } from "@/lib/save-share-post";

/** Yayına alınan haber için yan etkiler: sosyal, push, arama indeksi, takipçi bildirimi. */
export async function onArticlePublished(
  article: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    isBreaking: boolean;
    publishedAt: Date | null;
    authorId?: string;
    authorName?: string;
  },
  opts?: { wasPublished?: boolean },
) {
  if (opts?.wasPublished) return;

  let authorId = article.authorId;
  let authorName = article.authorName;
  if (!authorId || !authorName) {
    const row = await prisma.article.findUnique({
      where: { id: article.id },
      select: { authorId: true, author: { select: { name: true } } },
    });
    authorId = row?.authorId ?? "";
    authorName = row?.author?.name ?? "Yazar";
  }

  await Promise.all([
    sharePublishedArticle({
      title: article.title,
      slug: article.slug,
      summary: article.summary,
      isBreaking: article.isBreaking,
    }),
    saveGeneratedSharePost(article.id),
    article.isBreaking ? sendBreakingNewsPush({ title: article.title, slug: article.slug }) : Promise.resolve(),
    indexArticleInMeilisearch({
      id: article.id,
      title: article.title,
      slug: article.slug,
      summary: article.summary,
      content: article.content,
      publishedAt: article.publishedAt,
    }),
    ...(authorId
      ? [
          notifyAuthorFollowers({
            title: article.title,
            slug: article.slug,
            authorId,
            authorName,
          }),
        ]
      : []),
  ]);

  revalidatePublicSite();
}

/** Yayında olan habere son dakika işareti eklendiğinde bant ve bildirimleri güncelle. */
export async function onArticleBreakingEnabled(article: { title: string; slug: string }) {
  await Promise.all([
    sendBreakingNewsPush({ title: article.title, slug: article.slug }),
  ]);
  revalidatePublicSite();
}

/** Zamanlanmış haberleri yayına alır. */
export async function publishScheduledArticles() {
  const now = new Date();
  const due = await prisma.article.findMany({
    where: {
      scheduledAt: { lte: now, not: null },
      status: { in: ["DRAFT", "REVIEW"] },
    },
    take: 50,
  });

  let count = 0;
  for (const row of due) {
    const updated = await prisma.article.update({
      where: { id: row.id },
      data: {
        status: "PUBLISHED",
        publishedAt: row.scheduledAt ?? now,
        scheduledAt: null,
        approvedById: null,
        approvedAt: null,
      },
    });
    await onArticlePublished({
      id: updated.id,
      title: updated.title,
      slug: updated.slug,
      summary: updated.summary,
      content: updated.content,
      isBreaking: updated.isBreaking,
      publishedAt: updated.publishedAt,
    });
    count += 1;
  }

  if (count > 0) {
    await notifyAdmins({
      title: "Zamanlanmış yayın",
      body: `${count} haber otomatik yayına alındı.`,
      href: "/admin/makaleler",
    });
  }

  return { published: count };
}
