import { prisma } from "@/lib/prisma";
import { sharePublishedArticle } from "@/lib/social-share";
import { sendBreakingNewsPush } from "@/lib/web-push";
import { indexArticleInMeilisearch } from "@/lib/search-index";
import { revalidatePublicSite } from "@/lib/revalidate-site";
import { notifyAdmins } from "@/lib/notifications";
import { saveGeneratedSharePost } from "@/lib/save-share-post";

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  isBreaking: boolean;
  publishedAt: Date | null;
};

/** Yayına alınan haber için yan etkiler: sosyal, push, arama indeksi. */
export async function onArticlePublished(article: ArticleRow, opts?: { wasPublished?: boolean }) {
  if (opts?.wasPublished) return;

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
