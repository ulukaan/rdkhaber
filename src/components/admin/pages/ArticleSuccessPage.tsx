import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getArticleForEdit } from "@/lib/articles";
import { getSiteUrl } from "@/lib/site-url";
import { ArticleSuccessActions } from "@/components/admin/ArticleSuccessActions";

export async function ArticleSuccessPage({
  id,
  basePath,
  islem,
}: {
  id: string;
  basePath: string;
  islem?: string;
}) {
  const article = await getArticleForEdit(id);
  if (!article) notFound();

  const created = islem === "eklendi";
  const message = created
    ? "Haber başarı ile eklendi!"
    : "Haber başarı ile düzenlendi!";
  const shareUrl = `${getSiteUrl().replace(/\/$/, "")}/haber/${article.slug}`;
  const canView = article.status === "PUBLISHED";

  return (
    <div className="mx-auto max-w-4xl">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        Haberler / {created ? "Haber başarıyla eklendi" : "Haber başarıyla düzenlendi"}
      </p>

      <section className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-emerald-600 px-5 py-3.5 text-white sm:px-8">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
          <h2 className="text-sm font-bold sm:text-base">{message}</h2>
        </div>

        <div className="px-5 py-10 text-center sm:px-8">
          <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            {article.title}
          </h1>
          {article.summary ? (
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
              {article.summary}
            </p>
          ) : null}
        </div>

        <ArticleSuccessActions
          basePath={basePath}
          articleId={article.id}
          slug={article.slug}
          title={article.title}
          shareUrl={shareUrl}
          canView={canView}
        />
      </section>
    </div>
  );
}
