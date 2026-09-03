"use client";

import { useState } from "react";
import Link from "next/link";
import { CoverImage } from "@/components/news/CoverImage";
import { HEADLINE_OVERLAY, HEADLINE_TITLE_SHADOW, headlineFromArticle } from "@/components/news/HeadlineFace";
import { BreakingImageStamp } from "@/components/news/BreakingBadge";
import { isActiveBreaking } from "@/lib/breaking-news";
import type { ArticleSummary } from "@/types/article";
import { cn } from "@/lib/utils";

export function HeadlineSlider({
  articles,
  accent,
  max = 12,
  compact = false,
}: {
  articles: ArticleSummary[];
  accent?: string | null;
  max?: number;
  compact?: boolean;
}) {
  const slides = articles.slice(0, max);
  const [index, setIndex] = useState(0);
  const current = slides[index] ?? slides[0];
  const barColor = accent || "var(--brand)";

  if (!current) return null;

  const face = headlineFromArticle(current);

  return (
    <div
      className={cn(
        "relative h-full overflow-hidden lg:min-h-0",
        compact ? "min-h-[220px] md:min-h-[320px]" : "min-h-[260px] md:min-h-[380px]",
      )}
    >
      <Link
        href={`/haber/${current.slug}`}
        className="group absolute inset-0 block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      >
        <CoverImage
          src={current.coverImageUrl}
          alt={face.title}
          color={current.category.color}
          priority
          className="absolute inset-0 h-full w-full"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        {isActiveBreaking(current) ? <BreakingImageStamp /> : null}
        <span className={cn("absolute inset-0", HEADLINE_OVERLAY.bottomStrong)} />
        <span className="absolute inset-x-0 bottom-10 p-4 md:bottom-12 md:p-6">
          <span
            className={cn("mb-2 inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white", HEADLINE_TITLE_SHADOW)}
            style={{ backgroundColor: accent || current.category.color || "var(--brand)" }}
          >
            {face.kicker}
          </span>
          <h2 className={cn("line-clamp-3 text-lg font-extrabold leading-snug text-white md:text-2xl lg:text-[1.65rem]", HEADLINE_TITLE_SHADOW)}>
            {face.title}
          </h2>
        </span>
      </Link>

      {slides.length > 1 ? (
        <div
          className="absolute inset-x-0 bottom-0 z-10 flex border-t border-white/15"
          style={{ backgroundColor: barColor }}
          role="tablist"
          aria-label="Manşet seç"
        >
          {slides.map((article, i) => {
            const active = i === index;
            return (
              <button
                key={article.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={`Manşet ${i + 1}: ${article.title}`}
                onMouseEnter={() => setIndex(i)}
                onFocus={() => setIndex(i)}
                className={cn(
                  "relative flex-1 py-2 text-center text-[11px] font-extrabold tabular-nums tracking-wide text-white/75 transition-colors duration-200 md:py-2.5 md:text-xs",
                  active ? "bg-black/40 text-white" : "hover:bg-black/20 hover:text-white",
                )}
              >
                {active ? (
                  <span className="absolute inset-x-1 top-0 h-0.5 rounded-b-sm bg-white" aria-hidden />
                ) : null}
                {i + 1}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
