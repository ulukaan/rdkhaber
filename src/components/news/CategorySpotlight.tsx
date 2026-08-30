"use client";

import { useState } from "react";
import Link from "next/link";
import { CoverImage } from "@/components/news/CoverImage";
import type { ArticleSummary } from "@/types/article";
import { cn } from "@/lib/utils";
import { categoryHref } from "@/lib/category-path";

export type CategoryTab = {
  name: string;
  slug: string;
  color?: string | null;
  articles: ArticleSummary[];
};

export function CategorySpotlight({ tabs }: { tabs: CategoryTab[] }) {
  const visible = tabs.filter((t) => t.articles.length > 0);
  const [activeSlug, setActiveSlug] = useState(visible[0]?.slug ?? "");
  const current = visible.find((t) => t.slug === activeSlug) ?? visible[0];

  if (!current) return null;

  const [lead, ...rest] = current.articles;
  const grid = rest.slice(0, 4);
  const accent =
    current.color ||
    lead?.category.color ||
    current.articles[0]?.category.color ||
    "#d0021b";

  return (
    <section
      className="cat-spin-frame overflow-hidden rounded-sm"
      style={{ ["--cat-spin" as string]: accent }}
      aria-label="Kategori haberleri"
    >
      <div className="cat-spin-inner border border-transparent bg-white">
        <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visible.map((tab) => {
            const active = tab.slug === current.slug;
            const tabColor = tab.color || "#d0021b";
            return (
              <button
                key={tab.slug}
                type="button"
                onMouseEnter={() => setActiveSlug(tab.slug)}
                onFocus={() => setActiveSlug(tab.slug)}
                onClick={() => setActiveSlug(tab.slug)}
                className={cn(
                  "shrink-0 px-4 py-2.5 text-[12px] font-extrabold uppercase tracking-wide transition-colors",
                  active ? "text-white" : "bg-surface text-ink hover:bg-border",
                )}
                style={active ? { backgroundColor: tabColor } : undefined}
              >
                {tab.name}
              </button>
            );
          })}
          <Link
            href={categoryHref(current.slug)}
            className="ml-auto hidden shrink-0 items-center px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-ink-soft hover:text-brand sm:flex"
          >
            Tümü
          </Link>
        </div>

        <div className="grid gap-4 p-3 md:grid-cols-2">
          {lead ? (
            <Link href={`/haber/${lead.slug}`} className="group block">
              <CoverImage
                src={lead.coverImageUrl}
                alt={lead.title}
                color={lead.category.color}
                className="aspect-[16/9] w-full"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <h2 className="mt-3 text-lg font-extrabold leading-snug text-ink group-hover:text-brand md:text-xl">
                {lead.title}
              </h2>
              {lead.summary ? (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                  {lead.summary}
                </p>
              ) : null}
            </Link>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            {grid.map((article) => (
              <Link key={article.id} href={`/haber/${article.slug}`} className="group block">
                <CoverImage
                  src={article.coverImageUrl}
                  alt={article.title}
                  color={article.category.color}
                  className="aspect-[16/9] w-full"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <h3 className="mt-2 line-clamp-3 text-[13px] font-extrabold leading-snug text-ink group-hover:text-brand md:text-sm">
                  {article.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
