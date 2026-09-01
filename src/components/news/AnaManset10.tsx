"use client";

import Link from "next/link";
import { CoverImage } from "@/components/news/CoverImage";
import { HeadlineSlider } from "@/components/news/HeadlineSlider";
import { HEADLINE_OVERLAY, HEADLINE_TITLE_SHADOW, headlineFromArticle } from "@/components/news/HeadlineFace";
import type { ArticleSummary } from "@/types/article";
import { cn } from "@/lib/utils";

/** tebilisim “Ana Manşet 10”: sol büyük slider (1–10) + sağda 2×3 küçük manşet. */
export function AnaManset10({
  slides,
  side,
  accent,
}: {
  slides: ArticleSummary[];
  side: ArticleSummary[];
  accent?: string | null;
}) {
  if (slides.length === 0) return null;

  const sideItems = side.slice(0, 6);
  const hasSide = sideItems.length > 0;

  return (
    <section aria-label="Ana manşet" className="bg-surface">
      <div
        className={cn(
          "grid grid-cols-1 gap-1 lg:items-stretch",
          hasSide ? "lg:grid-cols-2" : "lg:grid-cols-1",
        )}
      >
        <div className="min-h-[280px] lg:min-h-[420px]">
          <HeadlineSlider articles={slides.slice(0, 10)} accent={accent} max={10} />
        </div>

        {hasSide ? (
          <div className="grid grid-cols-2 grid-rows-3 gap-1">
            {sideItems.map((article) => {
              const face = headlineFromArticle(article);
              return (
                <Link
                  key={article.id}
                  href={`/haber/${article.slug}`}
                  className="group relative block min-h-[110px] overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:min-h-0"
                >
                  <CoverImage
                    src={article.coverImageUrl}
                    alt={face.title}
                    color={article.category.color}
                    className="absolute inset-0 h-full w-full"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                  <span className={cn("absolute inset-0 transition-opacity group-hover:opacity-95", HEADLINE_OVERLAY.bottomStrong)} />
                  <span className="absolute inset-x-0 bottom-0 p-2.5 md:p-3">
                    <span
                      className={cn(
                        "mb-1 inline-block max-w-full truncate px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white",
                        HEADLINE_TITLE_SHADOW,
                      )}
                      style={{ backgroundColor: accent || article.category.color || "var(--brand)" }}
                    >
                      {face.kicker}
                    </span>
                    <span className={cn("line-clamp-2 text-[12px] font-extrabold leading-snug text-white md:text-[13px]", HEADLINE_TITLE_SHADOW)}>
                      {face.title}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
