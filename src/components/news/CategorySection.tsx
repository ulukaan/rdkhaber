import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsCard } from "@/components/news/NewsCard";
import type { ArticleSummary } from "@/types/article";
import { categoryHref } from "@/lib/category-path";

export function CategorySection({
  name,
  slug,
  color,
  articles,
}: {
  name: string;
  slug: string;
  color: string | null;
  articles: ArticleSummary[];
}) {
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles;
  const useRail = rest.length >= 2;

  return (
    <section>
      <SectionHeading title={name} href={categoryHref(slug)} accent={color} />
      {useRail ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <NewsCard
            article={lead}
            variant="stack"
            className="min-h-[240px] overflow-hidden md:min-h-[320px]"
          />
          <div className="flex flex-col divide-y divide-border border border-border bg-white">
            {rest.slice(0, 3).map((article) => (
              <div key={article.id} className="p-3">
                <NewsCard article={article} variant="horizontal" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} variant="poster" />
          ))}
        </div>
      )}
    </section>
  );
}
