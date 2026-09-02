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
            className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/60"
            aria-hidden
          />
          {isActiveBreaking(current) ? <BreakingImageStamp /> : null}

          <span className="absolute inset-0 z-[1] flex items-center justify-center px-5 py-8 sm:px-10 lg:px-14">
            <h2
              className={cn(
                "max-w-[18ch] text-center text-[1.75rem] font-black uppercase leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-[4.25rem]",
                HEADLINE_TITLE_SHADOW,
              )}
            >
              {title}
            </h2>
          </span>
        </Link>

        <div
          className="z-[2] flex w-9 shrink-0 flex-col border-l border-black/10 sm:w-11"
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
                  "relative flex flex-1 items-center justify-center border-b border-black/5 text-sm font-bold tabular-nums transition-colors last:border-b-0 disabled:cursor-default disabled:opacity-35",
                  active ? "bg-[#4a1530] text-white" : "bg-[#eceff3] text-ink hover:bg-[#e0e4ea]",
                )}
              >
                {active ? <span className="absolute inset-x-0 top-0 h-0.5 bg-brand" aria-hidden /> : null}
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
