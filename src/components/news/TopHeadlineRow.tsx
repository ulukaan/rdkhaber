import Link from "next/link";
import { CoverImage } from "@/components/news/CoverImage";
import { headlineFromArticle } from "@/components/news/HeadlineFace";
import type { ArticleSummary } from "@/types/article";

export function TopHeadlineRow({ articles }: { articles: ArticleSummary[] }) {
  const items = articles.slice(0, 5);
  if (items.length === 0) return null;

  return (
    <section aria-label="Üst manşet" className="mb-3">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-2 lg:grid-cols-5">
        {items.map((article) => {
          const face = headlineFromArticle(article);
          const color = article.category.color || "#d0021b";
          return (
            <div
              key={article.id}
              className="cat-spin-frame h-full overflow-hidden rounded-sm"
              style={{ ["--cat-spin" as string]: color }}
            >
              <Link
                href={`/haber/${article.slug}`}
                className="cat-spin-inner group flex h-full flex-col overflow-hidden border border-transparent bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
              >
                <CoverImage
                  src={article.coverImageUrl}
                  alt={face.title}
                  color={article.category.color}
                  fallback="wash"
                  className="aspect-square w-full"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                <div
                  className="flex flex-1 flex-col px-2.5 py-2 transition-colors duration-200 group-hover:bg-[var(--cat)] md:px-3 md:py-2.5"
                  style={{ ["--cat" as string]: color }}
                >
                  <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft group-hover:text-white/80 sm:text-[9px] sm:tracking-[0.14em]">
                    {article.category.name}
                  </span>
                  <h2 className="line-clamp-3 text-sm font-extrabold leading-snug text-ink group-hover:text-white sm:text-[13px] md:text-sm">
                    {face.title}
                  </h2>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
