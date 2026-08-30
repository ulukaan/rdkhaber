import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CoverImage } from "@/components/news/CoverImage";
import type { ArticleSummary } from "@/types/article";

export function NextArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <section className="mt-10" aria-labelledby="next-article-heading">
      <p
        id="next-article-heading"
        className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand"
      >
        Sıradaki haber
      </p>
      <Link
        href={`/haber/${article.slug}`}
        className="group grid overflow-hidden border border-border bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:grid-cols-[220px_1fr]"
      >
        <CoverImage
          src={article.coverImageUrl}
          alt={article.title}
          color={article.category.color}
          className="aspect-[16/10] w-full sm:aspect-auto sm:h-full sm:min-h-[160px]"
          sizes="(max-width: 640px) 100vw, 220px"
        />
        <div className="flex flex-col justify-center p-5">
          <span className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
            {article.category.name}
          </span>
          <h2 className="mt-2 text-lg font-extrabold leading-snug text-ink group-hover:text-brand md:text-xl">
            {article.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{article.summary}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand">
            Habere geç
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </Link>
    </section>
  );
}
