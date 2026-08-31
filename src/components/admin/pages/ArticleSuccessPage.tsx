import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getArticleForEdit } from "@/lib/articles";
import { getSiteUrl } from "@/lib/site-url";
import { formatDate } from "@/lib/utils";
import { CoverImage } from "@/components/news/CoverImage";
import { ArticleSuccessActions } from "@/components/admin/ArticleSuccessActions";
import { SharePostPreview } from "@/components/admin/SharePostPreview";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Taslak",
  REVIEW: "İncelemede",
  PUBLISHED: "Yayında",
  ARCHIVED: "Arşiv",
};

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
  const message = created ? "Haber başarıyla eklendi" : "Haber başarıyla güncellendi";
  const shareUrl = `${getSiteUrl().replace(/\/$/, "")}/haber/${article.slug}`;
  const canView = article.status === "PUBLISHED";
  const accent = article.category.color || "#d0021b";
  const statusText = STATUS_LABEL[article.status] ?? article.status;

  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        <span className="h-4 w-1 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
        Haberler / {message}
      </p>

      <section className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="relative">
          <CoverImage
            src={article.coverImageUrl}
            alt={article.title}
            color={accent}
            priority
            fallback="wash"
            className="aspect-[16/9] w-full"
            sizes="(max-width: 768px) 100vw, 768px"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-5">
            <span
              className="inline-flex items-center px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white"
              style={{ backgroundColor: accent }}
            >
              {article.category.name}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full"
                style={{ backgroundColor: accent }}
              >
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
              Kaydedildi
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">{message}</p>
            <h1 className="mt-1.5 line-clamp-3 max-w-2xl text-xl font-black leading-tight tracking-tight text-white sm:text-2xl">
              {article.title}
            </h1>
          </div>
        </div>

        <div className="h-1" style={{ backgroundColor: accent }} aria-hidden />

        <div className="px-5 py-5 sm:px-7">
          {article.summary ? (
            <p className="border-l-4 pl-3 text-sm leading-relaxed text-ink-soft" style={{ borderColor: accent }}>
              {article.summary}
            </p>
          ) : null}

          <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-ink-soft">
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Durum</dt>
              <dd
                className="rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white"
                style={{ backgroundColor: accent }}
              >
                {statusText}
              </dd>
            </div>
            <div>
              <dt className="inline">Kayıt · </dt>
              <dd className="inline">{formatDate(article.updatedAt ?? article.createdAt)}</dd>
            </div>
          </dl>
        </div>

        <ArticleSuccessActions
          basePath={basePath}
          articleId={article.id}
          slug={article.slug}
          title={article.title}
          shareUrl={shareUrl}
          canView={canView}
          accent={accent}
        />
      </section>

      <div className="mt-5">
        <SharePostPreview slug={article.slug} title={article.title} />
      </div>
    </div>
  );
}
