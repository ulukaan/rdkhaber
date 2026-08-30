"use client";

import Link from "next/link";
import { Camera, Megaphone, Send } from "lucide-react";
import { SidebarWidget } from "@/components/news/SidebarWidget";
import { SidebarNewsList } from "@/components/news/SidebarNewsList";
import { SidebarParity } from "@/components/news/SidebarParity";
import { SidebarPrayer } from "@/components/news/SidebarPrayer";
import type { ArticleSummary } from "@/types/article";
import type { MarketItem } from "@/lib/rates";
import type { PrayerDay } from "@/lib/prayer-times";
import { categoryHref } from "@/lib/category-path";

export type SidebarPanelsData = {
  related: ArticleSummary[];
  mostRead: ArticleSummary[];
  latest: ArticleSummary[];
  categoryName: string;
  categorySlug: string;
  parityItems: MarketItem[];
  prayers: PrayerDay | null;
};

export function ArticleSidebarPanels({
  related,
  mostRead,
  latest,
  categoryName,
  categorySlug,
  parityItems,
  prayers,
}: SidebarPanelsData) {
  return (
    <aside className="space-y-5">
      {parityItems.length > 0 ? <SidebarParity items={parityItems} /> : null}
      {prayers ? <SidebarPrayer day={prayers} /> : null}

      {latest.length > 0 ? (
        <SidebarWidget title="Son Dakika" href="/">
          <SidebarNewsList articles={latest.slice(0, 5)} />
        </SidebarWidget>
      ) : null}

      {mostRead.length > 0 ? (
        <SidebarWidget title="Çok Okunanlar" href="/">
          <SidebarNewsList articles={mostRead.slice(0, 6)} ranked />
        </SidebarWidget>
      ) : null}

      {related.length > 0 ? (
        <SidebarWidget title={categoryName} href={categoryHref(categorySlug)}>
          <SidebarNewsList articles={related.slice(0, 5)} />
        </SidebarWidget>
      ) : null}

      <section className="border border-border bg-white p-4">
        <h2 className="text-[12px] font-extrabold uppercase tracking-wide text-ink">
          Okuyucu masası
        </h2>
        <div className="mt-3 space-y-2">
          <Link
            href="/haber-gonder"
            className="flex items-center gap-2 border border-border bg-surface px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
          >
            <Send className="h-4 w-4 text-brand" aria-hidden />
            Haber gönder
          </Link>
          <Link
            href="/ihbar-hatti"
            className="flex items-center gap-2 border border-border bg-surface px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
          >
            <Megaphone className="h-4 w-4 text-brand" aria-hidden />
            İhbar hattı
          </Link>
          <Link
            href="/foto-galeri"
            className="flex items-center gap-2 border border-border bg-surface px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
          >
            <Camera className="h-4 w-4 text-brand" aria-hidden />
            Foto galeri
          </Link>
        </div>
      </section>
    </aside>
  );
}
