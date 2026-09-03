"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CoverImage } from "@/components/news/CoverImage";
import { HEADLINE_TITLE_SHADOW, headlineFromArticle } from "@/components/news/HeadlineFace";
import { BreakingImageStamp } from "@/components/news/BreakingBadge";
import { isActiveBreaking } from "@/lib/breaking-news";
import type { ArticleSummary } from "@/types/article";
import { cn } from "@/lib/utils";

const MAX = 10;

function surmansetImage(article: ArticleSummary) {
  return article.imageFiveHeadline || article.coverImageUrl;
}

export function SurmansetBanner({ articles }: { articles: ArticleSummary[] }) {
  const slides = articles.slice(0, MAX);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const current = slides[index] ?? slides[0];
  if (!current) return null;

  const face = headlineFromArticle(current);
  const title = face.title.trim().toLocaleUpperCase("tr-TR");
  const slotCount = Math.min(MAX, Math.max(slides.length, 5));

  return (
    <section aria-label="Sürmanşet" className="mb-4">
      <div className="relative flex min-h-[240px] overflow-hidden bg-ink sm:min-h-[320px] lg:min-h-[420px]">
        <Link
          href={`/haber/${current.slug}`}
          className="group relative min-w-0 flex-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <CoverImage
            src={surmansetImage(current)}
            alt={face.title}
            color={current.category.color}
            priority
            className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.02] motion-reduce:transform-none"
            sizes="100vw"
          />
          <span
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20"
            aria-hidden
          />
          {isActiveBreaking(current) ? <BreakingImageStamp /> : null}

          <span className="absolute inset-x-0 bottom-0 z-[1] flex items-end px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
            <h2
              className={cn(
                "w-full text-left text-lg font-black uppercase leading-[1.15] tracking-tight text-white text-balance sm:text-xl md:text-2xl lg:text-[1.85rem] xl:text-[2.15rem]",
                HEADLINE_TITLE_SHADOW,
              )}
            >
              {title}
            </h2>
          </span>
        </Link>

        <div
          className="z-[2] flex w-10 shrink-0 flex-col bg-[#f0f2f5] sm:w-12"
          role="tablist"
          aria-label="Sürmanşet seç"
        >
          {Array.from({ length: slotCount }, (_, i) => {
            const article = slides[i];
            const active = i === index;
            return (
              <button
                key={article?.id ?? `slot-${i}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={article ? `Manşet ${i + 1}: ${article.title}` : `Boş ${i + 1}`}
                disabled={!article}
                onClick={() => article && setIndex(i)}
                onMouseEnter={() => article && setIndex(i)}
                className={cn(
                  "relative flex flex-1 items-center justify-center border-b border-black/[0.06] text-[13px] font-extrabold tabular-nums tracking-wide transition-colors last:border-b-0 disabled:cursor-default disabled:opacity-30",
                  active
                    ? "bg-brand text-white"
                    : "bg-transparent text-ink-soft hover:bg-white hover:text-ink",
                )}
              >
                {active ? (
                  <span
                    className="absolute inset-y-1 left-0 w-[3px] rounded-r-sm bg-white/90"
                    aria-hidden
                  />
                ) : null}
                <span className={cn(active && "drop-shadow-sm")}>{i + 1}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
