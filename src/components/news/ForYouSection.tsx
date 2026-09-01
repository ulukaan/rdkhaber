"use client";

import { NewsCard } from "@/components/news/NewsCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { getPersonalizedArticles } from "@/lib/personalized";

type Article = Awaited<ReturnType<typeof getPersonalizedArticles>>[number];

export function ForYouSection({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-8">
      <SectionHeading title="Senin için" href="/hesabim/okuduklarim" />
      <p className="mb-4 text-sm text-ink-soft">
        Okuma geçmişinize ve takip ettiğiniz yazarlara göre seçildi.
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} variant="poster" />
        ))}
      </div>
    </section>
  );
}
