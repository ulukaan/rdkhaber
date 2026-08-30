"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NewsCard } from "@/components/news/NewsCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ArticleSummary } from "@/types/article";

export function InfiniteNewsFeed({
  excludeIds,
  initial,
}: {
  excludeIds: string[];
  initial: ArticleSummary[];
}) {
  const [items, setItems] = useState(initial);
  const [skip, setSkip] = useState(initial.length);
  const [hasMore, setHasMore] = useState(initial.length >= 6);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        skip: String(skip),
        take: "8",
        exclude: excludeIds.join(","),
      });
      const res = await fetch(`/api/haberler/akıs?${params.toString()}`);
      if (!res.ok) {
        setHasMore(false);
        return;
      }
      const data = (await res.json()) as { items: ArticleSummary[]; hasMore: boolean };
      setItems((prev) => [...prev, ...data.items]);
      setSkip((prev) => prev + data.items.length);
      setHasMore(data.hasMore);
    } finally {
      setLoading(false);
    }
  }, [excludeIds, hasMore, loading, skip]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (items.length === 0) {
    return (
      <section className="mt-10 border border-border bg-surface p-6 text-sm text-ink-soft">
        Akışta başka haber yok.
      </section>
    );
  }

  return (
    <section className="mt-10" aria-labelledby="feed-heading">
      <SectionHeading title="Sonsuz haber akışı" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((article) => (
          <NewsCard key={article.id} article={article} variant="caption" />
        ))}
      </div>
      <div ref={sentinel} className="h-8" aria-hidden />
      {loading ? (
        <p className="py-4 text-center text-sm text-ink-soft">Daha fazla haber yükleniyor…</p>
      ) : null}
      {!hasMore ? (
        <p className="py-4 text-center text-xs text-ink-soft">Akışın sonuna geldiniz.</p>
      ) : null}
    </section>
  );
}
