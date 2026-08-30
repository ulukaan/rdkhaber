"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { formatChange, formatMarketValue, type MarketGroup, type MarketItem } from "@/lib/rates";
import { cn } from "@/lib/utils";

const ROTATE_MS = 5000;

function RateItems({ items }: { items: MarketItem[] }) {
  return items.map((item) => {
    const up = (item.change ?? 0) > 0;
    const down = (item.change ?? 0) < 0;
    return (
      <li
        key={item.code}
        className="flex shrink-0 items-center gap-1.5 border-l border-border pl-3 text-xs"
      >
        <span className="font-bold text-ink">{item.label}</span>
        <span className="font-semibold text-ink-soft tabular-nums">{formatMarketValue(item)}</span>
        {item.change != null ? (
          <span
            className={cn(
              "tabular-nums text-[11px] font-semibold",
              up && "text-emerald-700",
              down && "text-brand",
              !up && !down && "text-ink-soft",
            )}
          >
            {formatChange(item.change)}
          </span>
        ) : null}
      </li>
    );
  });
}

export function RatesBarClient({
  groups,
  date,
}: {
  groups: MarketGroup[];
  date: string | null;
}) {
  const [index, setIndex] = useState(0);
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const indexRef = useRef(0);

  useEffect(() => {
    if (groups.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      const current = indexRef.current;
      const next = (current + 1) % groups.length;
      indexRef.current = next;
      setOutgoing(current);
      setIndex(next);
      setTick((n) => n + 1);
    }, ROTATE_MS);

    return () => window.clearInterval(id);
  }, [groups.length]);

  const group = groups[index];
  const previous = outgoing != null ? groups[outgoing] : null;
  if (!group) return null;

  return (
    <div className="border-b border-border bg-surface">
      <Container className="flex h-10 items-center gap-2 overflow-x-auto whitespace-nowrap sm:h-9 sm:gap-3 sm:overflow-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="sticky left-0 z-[1] flex shrink-0 items-center gap-1.5 bg-surface pr-2 text-[11px] font-bold uppercase tracking-wide text-brand">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden />
          Kur
        </span>

        <div className="relative min-h-5 min-w-0 flex-1 sm:overflow-hidden">
          {previous ? (
            <ul
              key={`out-${tick}`}
              className="rates-swap-out absolute inset-y-0 left-0 flex items-center gap-3"
              aria-hidden
              onAnimationEnd={() => setOutgoing(null)}
            >
              <RateItems items={previous.items} />
            </ul>
          ) : null}
          <ul
            key={`in-${tick}`}
            className={cn("flex items-center gap-3", previous && "rates-swap-in")}
            aria-live="off"
          >
            <RateItems items={group.items} />
          </ul>
        </div>

        {date ? (
          <span className="ml-auto hidden shrink-0 pl-3 text-[11px] text-ink-soft lg:block">
            {date.slice(11, 16) || date}
          </span>
        ) : null}
      </Container>
    </div>
  );
}
