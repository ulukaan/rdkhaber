"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { statusForRange, type BroadcastItem, type BroadcastStatus } from "@/lib/broadcast";
import { cn } from "@/lib/utils";

function liveStatus(item: BroadcastItem): BroadcastStatus {
  return statusForRange(item.startMin, item.endMin);
}

export function BroadcastStrip({ items }: { items: BroadcastItem[] }) {
  const scroller = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
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

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return items;
    return items.filter(
      (item) =>
        item.channel.toLocaleLowerCase("tr-TR").includes(q) ||
        item.title.toLocaleLowerCase("tr-TR").includes(q),
    );
  }, [items, query]);

  if (items.length === 0) return null;

  function scroll(dir: -1 | 1) {
    scroller.current?.scrollBy({ left: dir * 240, behavior: "smooth" });
  }

  return (
    <section className="mt-4 border border-border bg-white" aria-label="Yayın akışı">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-extrabold tracking-tight text-ink">Yayın Akışı</h2>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <label className="relative min-w-[160px] flex-1 sm:max-w-[220px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-soft" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kanal arayın.."
              className="w-full border border-border bg-surface/50 py-1.5 pl-8 pr-3 text-sm text-ink outline-none placeholder:text-ink-soft focus:border-ink/30"
            />
          </label>
          <Link
            href="/yayin-akisi"
            className="inline-flex items-center gap-1 text-xs font-bold text-ink-soft hover:text-brand"
          >
            Tüm Programlar
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="relative px-2 py-4 sm:px-4">
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="absolute left-1 top-[42%] z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center border border-border bg-white text-ink shadow-sm sm:flex"
          aria-label="Önceki kanallar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          className="absolute right-1 top-[42%] z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center border border-border bg-white text-ink shadow-sm sm:flex"
          aria-label="Sonraki kanallar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <ul
          ref={scroller}
          className="flex gap-[15px] overflow-x-auto px-1 py-1 [scrollbar-width:none] sm:px-8 [&::-webkit-scrollbar]:hidden"
        >
          {filtered.map((item) => {
            const status = statuses[item.id] ?? item.status;
            const live = status === "CANLI";
            return (
              <li key={item.id} className="w-[103px] shrink-0">
                <Link
                  href={item.href}
                  className="group flex h-[120px] flex-col items-center rounded-md bg-white px-1 pt-2 transition-shadow hover:shadow-md"
                  aria-label={`${item.channel} yayın akışı`}
                >
                  <span className="relative flex h-[72px] w-full items-center justify-center">
                    <img
                      src={item.logoUrl}
                      alt=""
                      width={50}
                      height={50}
                      className="h-[50px] w-[50px] object-contain"
                    />
                    {live ? (
                      <span className="absolute right-1 top-0 bg-brand px-1 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
                        Canlı
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 line-clamp-1 w-full px-0.5 text-center text-[13px] font-semibold leading-tight text-ink group-hover:text-brand">
                    {item.channel}
                  </span>
                  <span className="mt-0.5 line-clamp-1 w-full px-0.5 text-center text-[10px] font-medium tabular-nums text-ink-soft">
                    {item.time} {item.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-soft">Kanal bulunamadı.</p>
        ) : null}
      </div>
    </section>
  );
}
