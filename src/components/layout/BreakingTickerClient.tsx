"use client";

import { useCallback, useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { BreakingTickerTrack } from "@/components/layout/BreakingTickerTrack";
import type { BreakingTickerItem } from "@/lib/breaking-ticker";

const POLL_MS = 8_000;

export function BreakingTickerClient({ initialItems }: { initialItems: BreakingTickerItem[] }) {
  const [items, setItems] = useState(initialItems);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/breaking-ticker", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { items?: BreakingTickerItem[] };
      if (Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch {
      /* Ağ hatasında mevcut liste korunur */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, POLL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const onFocus = () => {
      void refresh();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  if (items.length === 0) return null;

  return (
    <div
      className="bg-brand text-white"
      role="region"
      aria-label="Son dakika haberleri"
      aria-live="polite"
    >
      <Container className="flex items-stretch">
        <span className="flex shrink-0 items-center bg-ink px-3 text-[11px] font-black uppercase tracking-[0.14em] sm:px-4">
          Son Dakika
        </span>
        <BreakingTickerTrack items={items} />
      </Container>
    </div>
  );
}
