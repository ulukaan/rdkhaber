import { notFound } from "next/navigation";
import { getArticleForEdit } from "@/lib/articles";
import { PageHeader } from "@/components/admin/PageHeader";
import { HeadlineDesignForm } from "@/components/admin/HeadlineDesignForm";
import type { HeadlineAlign } from "@/components/news/HeadlineFace";

export async function HeadlineDesignPage({
  id,
  cancelHref,
}: {
  id: string;
  cancelHref: string;
}) {
  const article = await getArticleForEdit(id);
  if (!article) notFound();

  const align: HeadlineAlign =
    article.headlineAlign === "center" || article.headlineAlign === "right"
      ? article.headlineAlign
      : "left";
  const imageAlign: HeadlineAlign =
    article.headlineImageAlign === "left" || article.headlineImageAlign === "right"
      ? article.headlineImageAlign
      : "center";

  return (
    <>
      <PageHeader
        title="Manşet tasarımı"
        description="Kart önizlemesini düzenleyin. Ana başlık sitede manşet kartında görünür."
      />
      <HeadlineDesignForm
        articleId={article.id}
        coverImageUrl={article.coverImageUrl}
        color={article.category.color}
        cancelHref={cancelHref}
        defaults={{
          kicker: article.headlineKicker ?? article.category.name,
          title: article.headlineTitle ?? article.title,
          sub: article.headlineSub ?? "",
          align,
          imageAlign,
        }}
      />
    </>
  );
}
