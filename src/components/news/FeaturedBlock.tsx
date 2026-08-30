import { HeadlineSlider } from "@/components/news/HeadlineSlider";
import { NewsCard } from "@/components/news/NewsCard";
import type { ArticleSummary } from "@/types/article";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FeaturedBlock({
  slides,
  secondary,
  rail,
}: {
  slides: ArticleSummary[];
  secondary: ArticleSummary[];
  rail?: ReactNode;
}) {
  const stacked = secondary.slice(0, 2);
  if (slides.length === 0) return null;
  const hasRail = Boolean(rail);

  return (
    <section aria-label="Ana manşet" className="mb-3">
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-12 lg:items-stretch">
        <div
          className={cn(
            "grid grid-cols-1 gap-2 lg:h-[440px] lg:grid-cols-12 xl:h-[480px]",
            hasRail ? "lg:col-span-9" : "lg:col-span-12",
          )}
        >
          <div className="min-h-[260px] lg:col-span-8 lg:min-h-0">
            <HeadlineSlider articles={slides} />
          </div>
          <div className="flex flex-col gap-2 lg:col-span-4">
            {stacked.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                variant="caption"
                className="min-h-[160px] flex-1"
              />
            ))}
          </div>
        </div>
        {hasRail ? (
          <div className="hidden min-h-0 lg:col-span-3 lg:flex lg:justify-end">{rail}</div>
        ) : null}
      </div>
    </section>
  );
}
