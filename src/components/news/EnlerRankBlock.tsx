import { RankedNewsHoverList } from "@/components/news/RankedNewsHoverList";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ArticleSummary } from "@/types/article";
import { cn } from "@/lib/utils";

export function EnlerRankBlock({
  id,
  title,
  subtitle,
  articles,
  className,
}: {
  id: string;
  title: string;
  subtitle?: string;
  articles: ArticleSummary[];
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-28 border border-border bg-white p-4", className)}>
      <SectionHeading title={title} className="mb-2" />
      {subtitle ? <p className="mb-3 text-xs text-ink-soft">{subtitle}</p> : null}
      {articles.length === 0 ? (
        <p className="border border-dashed border-border bg-surface px-4 py-6 text-sm text-ink-soft">
          Bu listede henüz haber yok.
        </p>
      ) : (
        <RankedNewsHoverList articles={articles} />
      )}
    </section>
  );
}
