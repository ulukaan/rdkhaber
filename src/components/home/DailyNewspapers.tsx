"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { NewspaperCover } from "@/lib/newspapers";
import { cn } from "@/lib/utils";

const VISIBLE = 6;
const GAP_PX = 12;

export function DailyNewspapers({ items }: { items: NewspaperCover[] }) {
  const titleId = useId();
  const scroller = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState<NewspaperCover | null>(null);
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(items.length / VISIBLE));
  const canScroll = items.length > VISIBLE;

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(null);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  const syncPage = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      setPage(0);
      return;
    }
    const next = Math.round((el.scrollLeft / maxScroll) * (pageCount - 1));
    setPage(Math.min(pageCount - 1, Math.max(0, next)));
  }, [pageCount]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    syncPage();
    el.addEventListener("scroll", syncPage, { passive: true });
    window.addEventListener("resize", syncPage);
    return () => {
      el.removeEventListener("scroll", syncPage);
      window.removeEventListener("resize", syncPage);
    };
  }, [syncPage, items.length]);

  if (items.length === 0) return null;

  function scroll(dir: -1 | 1) {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  }

  function goToPage(index: number) {
    const el = scroller.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    const ratio = pageCount <= 1 ? 0 : index / (pageCount - 1);
    el.scrollTo({ left: ratio * maxScroll, behavior: "smooth" });
  }

  const cardBasis = `calc((100% - ${(VISIBLE - 1) * GAP_PX}px) / ${VISIBLE})`;

  return (
    <section className="min-w-0 max-w-full" aria-label="Günlük gazeteler">
      <div className="mb-3 flex items-center justify-between border-b-2 border-ink pb-2">
        <h2 className="flex items-center gap-2 text-lg font-extrabold uppercase tracking-tight text-ink">
          <span className="h-5 w-1.5 shrink-0 bg-brand" aria-hidden />
          Günlük Gazeteler
        </h2>
        <p className="hidden text-[11px] font-semibold uppercase tracking-wide text-ink-soft sm:block">
          Bugünkü ilk sayfalar
        </p>
      </div>

      <div className="min-w-0 overflow-hidden border border-border bg-white">
        <div className="relative min-w-0 overflow-hidden px-3 pt-3 sm:px-4 sm:pt-4">
          <ul
            ref={scroller}
            className="flex min-w-0 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ gap: GAP_PX }}
          >
            {items.map((paper) => (
              <li
                key={`${paper.region}-${paper.slug}`}
                className="min-w-0 shrink-0 grow-0"
                style={{ flex: `0 0 ${cardBasis}`, width: cardBasis, maxWidth: cardBasis }}
              >
                <button
                  type="button"
                  onClick={() => setActive(paper)}
                  className="group flex w-full max-w-full flex-col text-left"
                  aria-label={`${paper.name} ilk sayfasını büyüt`}
                >
                  <span className="relative block w-full overflow-hidden border border-border bg-surface transition-[border-color,box-shadow] group-hover:border-brand/50 group-hover:shadow-sm">
                    {paper.region === "local" ? (
                      <span className="absolute left-0 top-0 z-[1] bg-brand px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
                        Düzce
                      </span>
                    ) : null}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={paper.imageUrl}
                      alt={`${paper.name} bugünkü ilk sayfa`}
                      className="aspect-[3/4] w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </span>
                  <span className="mt-2 line-clamp-2 min-h-[2.25rem] text-center text-[11px] font-extrabold uppercase leading-snug tracking-wide text-ink group-hover:text-brand">
                    {paper.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {canScroll ? (
          <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2.5 sm:px-4">
            <button
              type="button"
              onClick={() => scroll(-1)}
              disabled={page <= 0}
              className="flex h-8 w-8 items-center justify-center border border-border text-ink transition-colors hover:border-brand hover:text-brand disabled:opacity-30"
              aria-label="Önceki gazeteler"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
            </button>

            <div className="flex items-center gap-1.5" role="tablist" aria-label="Sayfalar">
              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === page}
                  aria-label={`Sayfa ${i + 1}`}
                  onClick={() => goToPage(i)}
                  className={cn(
                    "h-1.5 w-4 transition-colors",
                    i === page ? "bg-brand" : "bg-border hover:bg-ink/30",
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => scroll(1)}
              disabled={page >= pageCount - 1}
              className="flex h-8 w-8 items-center justify-center border border-border text-ink transition-colors hover:border-brand hover:text-brand disabled:opacity-30"
              aria-label="Sonraki gazeteler"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
            </button>
          </div>
        ) : (
          <div className="pb-3" />
        )}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/80 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={() => setActive(null)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden border border-border bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b-2 border-ink px-4 py-3">
              <div className="min-w-0">
                <h3
                  id={titleId}
                  className="flex items-center gap-2 truncate text-base font-extrabold uppercase tracking-tight text-ink"
                >
                  <span className="h-4 w-1.5 shrink-0 bg-brand" aria-hidden />
                  {active.name}
                </h3>
                <p className="mt-1 pl-3.5 text-xs text-ink-soft">
                  {active.region === "local" ? "Düzce yerel gazete" : "Ulusal gazete"}
                  {active.dateLabel ? ` · ${active.dateLabel}` : " · Bugünkü ilk sayfa"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center border border-border text-ink hover:border-brand hover:text-brand"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto bg-surface p-3 sm:p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={active.imageUrl}
                alt={`${active.name} bugünkü ilk sayfa — tam boy`}
                className="mx-auto h-auto w-full max-w-[720px] border border-border bg-white object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
