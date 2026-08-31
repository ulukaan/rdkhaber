import type { Metadata } from "next";
import {
  getMostBookmarkedArticles,
  getMostCommentedArticles,
  getMostReadArticles,
  getTrendingArticles,
} from "@/lib/articles";
import { Container } from "@/components/ui/Container";
import { LineHeading } from "@/components/home/LineHeading";
import { EnlerRankBlock } from "@/components/news/EnlerRankBlock";

export const metadata: Metadata = {
  title: "Enler",
  description: "En çok okunan, trend, yorumlanan ve kaydedilen haberler.",
};

export const revalidate = 300;

export default async function EnlerPage() {
  const [mostRead, trending, mostCommented, mostBookmarked] = await Promise.all([
    getMostReadArticles(10),
    getTrendingArticles(10),
    getMostCommentedArticles(10),
    getMostBookmarkedArticles(10),
  ]);

  return (
    <Container className="py-8">
      <LineHeading title="Enler" as="h1" />
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Okuyucuların ve üyelerin en çok ilgi gösterdiği haberler — okunma, haftalık trend,
        yorum ve kaydetme sıralamaları.
      </p>

      <nav
        aria-label="Enler bölümleri"
        className="mb-6 flex flex-wrap gap-2 border border-border bg-surface p-3"
      >
        {[
          { href: "#cok-okunanlar", label: "Çok okunanlar" },
          { href: "#haftanin-trendi", label: "Haftanın trendi" },
          { href: "#en-cok-yorumlanan", label: "En çok yorumlanan" },
          { href: "#en-cok-kaydedilen", label: "En çok kaydedilen" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:border-brand hover:text-brand"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="grid gap-6 lg:grid-cols-2">
        <EnlerRankBlock id="cok-okunanlar" title="Çok Okunanlar" articles={mostRead} />
        <EnlerRankBlock
          id="haftanin-trendi"
          title="Haftanın Trendi"
          subtitle="Son 7 günde yayınlanan haberler — okunma sayısına göre"
          articles={trending}
        />
        <EnlerRankBlock
          id="en-cok-yorumlanan"
          title="En Çok Yorumlanan"
          subtitle="Onaylı okuyucu yorumlarına göre"
          articles={mostCommented}
        />
        <EnlerRankBlock
          id="en-cok-kaydedilen"
          title="En Çok Kaydedilen"
          subtitle="Üye hesaplarında kaydedilen haberler"
          articles={mostBookmarked}
        />
      </div>
    </Container>
  );
}
