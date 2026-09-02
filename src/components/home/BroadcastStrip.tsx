"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { statusForRange, type BroadcastItem, type BroadcastStatus } from "@/lib/broadcast";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;
const ACCENT = "#f5c518";

function liveStatus(item: BroadcastItem): BroadcastStatus {
  return statusForRange(item.startMin, item.endMin, undefined, item.date);
}

function statusLabel(status: BroadcastStatus) {
  if (status === "CANLI") return "CANLI";
  if (status === "TEKRAR") return "TEKRAR";
  return "YAKINDA";
}

export function BroadcastStrip({ items }: { items: BroadcastItem[] }) {
  const scroller = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(0);
  const [statuses, setStatuses] = useState<Record<string, BroadcastStatus>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.status])),
  );

  useEffect(() => {
    function tick() {
      setStatuses(Object.fromEntries(items.map((item) => [item.id, liveStatus(item)])));
    }
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [items]);

  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

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
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 12 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step * PAGE_SIZE, behavior: "smooth" });
  }

  function goToPage(index: number) {
    const el = scroller.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) return;
    const ratio = pageCount <= 1 ? 0 : index / (pageCount - 1);
    el.scrollTo({ left: ratio * maxScroll, behavior: "smooth" });
  }

  return (
    <section className="mt-0 overflow-hidden bg-brand text-white" aria-label="Yayın akışı">
      <div className="flex items-center gap-2 px-3 pt-2.5 sm:px-4">
        <h2 className="shrink-0 text-sm font-bold tracking-tight">Yayın Akışı</h2>
        <span className="h-px min-w-0 flex-1 bg-white/35" aria-hidden />
        <Link
          href="/yayin-akisi"
          className="shrink-0 text-xs font-medium text-white/90 transition-colors hover:text-white"
        >
          Tümü
        </Link>
      </div>

      <div className="relative px-3 py-2.5 sm:px-4">
        <ul
          ref={scroller}
          className="flex gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => {
            const status = statuses[item.id] ?? item.status;
            const thumb = item.imageUrl || item.logoUrl;
            const isLogoFallback = !item.imageUrl;

            return (
              <li key={item.id} className="w-[min(38vw,148px)] shrink-0 sm:w-[156px]">
                <Link href={item.href} className="group block" aria-label={`${item.channel}: ${item.title}`}>
                  <span className="relative mb-1.5 block aspect-[16/9] overflow-hidden bg-black/20">
                    <Image
                      src={thumb}
                      alt=""
                      fill
                      className={cn(
                        "transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none",
                        isLogoFallback ? "object-contain p-4" : "object-cover",
                      )}
                      sizes="156px"
                      unoptimized
                    />
                    <span
                      className={cn(
                        "absolute left-0 top-0 px-1 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white",
                        status === "CANLI" ? "bg-[#d0021b]" : "bg-black/55",
                      )}
                    >
                      {statusLabel(status)}
                    </span>
                  </span>
                  <span
                    className="block text-sm font-extrabold tabular-nums leading-none"
                    style={{ color: ACCENT }}
                  >
                    {item.time}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-[12px] font-medium leading-snug text-white">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-white/70">{item.channel}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex items-center justify-between gap-3 px-3 pb-2.5 sm:px-4">
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="flex h-7 w-7 items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-30"
          style={{ color: ACCENT }}
          aria-label="Önceki programlar"
          disabled={page <= 0}
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
        </button>

        <div className="flex flex-wrap items-center justify-center gap-1.5" role="tablist" aria-label="Sayfalar">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === page}
              aria-label={`Sayfa ${i + 1}`}
              onClick={() => goToPage(i)}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                i === page ? "scale-110" : "bg-[#7a0a14]",
              )}
              style={i === page ? { backgroundColor: ACCENT } : undefined}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll(1)}
          className="flex h-7 w-7 items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-30"
          style={{ color: ACCENT }}
          aria-label="Sonraki programlar"
          disabled={page >= pageCount - 1}
        >
          <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
        </button>
      </div>
    </section>
  );
}
