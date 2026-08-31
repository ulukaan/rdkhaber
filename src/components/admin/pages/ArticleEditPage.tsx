import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { canEditArticle } from "@/lib/article-access";
import { getArticleForEdit } from "@/lib/articles";
import { PageHeader } from "@/components/admin/PageHeader";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { LiveBlogEditor } from "@/components/admin/LiveBlogEditor";
import { CorrectionPanel } from "@/components/admin/CorrectionPanel";
import { Button } from "@/components/ui/Button";

export async function ArticleEditPage({ id }: { id: string }) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const [article, categories] = await Promise.all([
    getArticleForEdit(id),
    prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!article || !canEditArticle(session, article)) notFound();

  const base = session.user.role === "ADMIN" ? "/admin" : "/editor";

  return (
    <>
      <PageHeader
        title="Haberi düzenle"
        description={article.title}
        action={
          <Button href={`${base}/makaleler/${id}/revizyonlar`} size="sm" variant="outline">
            Revizyon geçmişi
          </Button>
        }
      />
      <ArticleForm
        categories={categories}
        defaults={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          summary: article.summary,
          content: article.content,
          coverImageUrl: article.coverImageUrl,
          videoUrl: article.videoUrl,
          videoEmbed: article.videoEmbed,
          galleryImages: article.images.map((img) => ({
            url: img.imageUrl,
            caption: img.caption ?? "",
          })),
          categoryId: article.categoryId,
          tagNames: article.tags.map((t) => t.name).join(", "),
          status: article.status,
          isBreaking: article.isBreaking,
          isFeatured: article.isFeatured,
          inSpotlight: article.inSpotlight,
          inFiveHeadline: article.inFiveHeadline,
          imageMainHeadline: article.imageMainHeadline,
          imageTopHeadline: article.imageTopHeadline,
          imageSpotlight: article.imageSpotlight,
          imageFiveHeadline: article.imageFiveHeadline,
          imageSocial: article.imageSocial,
          imageStory: article.imageStory,
          reporterName: article.reporterName,
          sourceName: article.sourceName,
          sourceUrl: article.sourceUrl,
          redirectUrl: article.redirectUrl,
          seoTitle: article.seoTitle,
          seoDescription: article.seoDescription,
          seoKeywords: article.seoKeywords,
          publishedAt: article.publishedAt,
          scheduledAt: article.scheduledAt,
          isLiveBlog: article.isLiveBlog,
          viewCount: article.viewCount,
        }}
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <LiveBlogEditor articleId={article.id} />
        <CorrectionPanel articleId={article.id} />
      </div>
    </>
  );
}
