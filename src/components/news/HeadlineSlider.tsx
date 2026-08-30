"use client";

import { useState } from "react";
import Link from "next/link";
import { CoverImage } from "@/components/news/CoverImage";
import { headlineFromArticle } from "@/components/news/HeadlineFace";
import type { ArticleSummary } from "@/types/article";
import { cn } from "@/lib/utils";

export function HeadlineSlider({
  articles,
  accent,
  max = 12,
}: {
  articles: ArticleSummary[];
  accent?: string | null;
  max?: number;
}) {
  const slides = articles.slice(0, max);
  const [index, setIndex] = useState(0);
  const current = slides[index] ?? slides[0];
  const barColor = accent || "var(--brand)";

  if (!current) return null;

  const face = headlineFromArticle(current);

  return (
    <div className="relative h-full min-h-[260px] overflow-hidden md:min-h-[380px] lg:min-h-0">
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
        <span className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
        <span className="absolute inset-x-0 bottom-10 p-4 md:bottom-12 md:p-6">
          <span
            className="mb-2 inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white"
            style={{ backgroundColor: accent || current.category.color || "var(--brand)" }}
          >
            {face.kicker}
          </span>
          <h2 className="line-clamp-3 text-lg font-extrabold leading-snug text-white md:text-2xl lg:text-[1.65rem]">
            {face.title}
          </h2>
        </span>
      </Link>

      {slides.length > 1 ? (
        <div
          className="absolute inset-x-0 bottom-0 z-10 flex"
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
                  "flex-1 py-1.5 text-center text-[11px] font-bold text-white transition-colors duration-200 md:py-2 md:text-xs",
                  active ? "bg-ink/35" : "hover:bg-black/15",
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
