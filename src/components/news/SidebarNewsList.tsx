import Link from "next/link";
import { CoverImage } from "@/components/news/CoverImage";
import { RankedNewsHoverList } from "@/components/news/RankedNewsHoverList";
import { formatRelativeTime } from "@/lib/utils";
import type { ArticleSummary } from "@/types/article";

export function SidebarNewsList({
  articles,
  ranked = false,
}: {
  articles: ArticleSummary[];
  ranked?: boolean;
}) {
  if (articles.length === 0) return null;

  if (ranked) {
    return <RankedNewsHoverList articles={articles} />;
  }

  return (
    <ul className="divide-y divide-border">
      {articles.map((article) => (
        <li key={article.id}>
          <Link
            href={`/haber/${article.slug}`}
            className="group flex gap-3 py-3 first:pt-0 last:pb-0"
          >
            <CoverImage
              src={article.coverImageUrl}
              alt=""
              color={article.category.color}
              className="aspect-[4/3] w-[72px] shrink-0"
              sizes="72px"
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-3 text-[13px] font-bold leading-snug text-ink group-hover:text-brand">
                {article.title}
              </p>
              <p className="mt-1 text-[11px] text-ink-soft">
                {article.category.name}
                {article.publishedAt
                  ? ` · ${formatRelativeTime(article.publishedAt)}`
                  : ""}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
