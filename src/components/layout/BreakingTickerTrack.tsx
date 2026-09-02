"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function BreakingTickerTrack({
  items,
}: {
  items: { title: string; slug: string }[];
}) {
  const [paused, setPaused] = useState(false);
  const loop = [...items, ...items];
  const trackKey = items.map((item) => item.slug).join("|");

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden">
      <div
        key={trackKey}
        className={cn("ticker-track", paused && "is-paused")}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        onTouchCancel={() => setPaused(false)}
      >
        {loop.map((a, i) => (
          <span key={`${a.slug}-${i}`} className="flex shrink-0 items-center gap-6">
            <Link
              href={`/haber/${a.slug}`}
              className="whitespace-nowrap text-sm font-semibold text-white/95 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {a.title}
            </Link>
            <span className="h-1 w-1 shrink-0 rounded-full bg-white/50" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
}
