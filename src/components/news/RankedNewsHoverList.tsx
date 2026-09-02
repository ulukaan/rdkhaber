import Link from "next/link";
import type { ArticleSummary } from "@/types/article";
import { cn } from "@/lib/utils";

export function RankedNewsHoverList({
  articles,
  className,
}: {
  articles: ArticleSummary[];
  className?: string;
}) {
  if (articles.length === 0) return null;

  return (
    <ol className={cn("flex flex-col", className)}>
      {articles.map((article, index) => {
        const rank = index + 1;
        const top = rank === 1;
        return (
          <li key={article.id}>
            <Link
              href={`/haber/${article.slug}`}
              className="group flex items-start gap-3 border-b border-border/80 py-2.5 last:border-0 hover:bg-surface/60"
            >
              <span
                className={cn(
                  "mt-0.5 w-7 shrink-0 text-xl font-black tabular-nums leading-none",
                  top ? "text-brand" : "text-ink-soft/55 group-hover:text-brand",
                )}
              >
                {String(rank).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 text-[13px] leading-snug transition-colors",
                  top
                    ? "font-extrabold text-ink group-hover:text-brand"
                    : "font-semibold text-ink group-hover:text-brand",
                )}
              >
                <span className="line-clamp-2">{article.title}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
