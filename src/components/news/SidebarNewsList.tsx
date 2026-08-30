import Link from "next/link";
import { CoverImage } from "@/components/news/CoverImage";
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

  return (
    <ul className="divide-y divide-border">
      {articles.map((article, i) => (
        <li key={article.id}>
          <Link
            href={`/haber/${article.slug}`}
            className="group flex gap-3 py-3 first:pt-0 last:pb-0"
          >
            {ranked ? (
              <span className="w-6 shrink-0 pt-0.5 text-lg font-black leading-none text-border group-hover:text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
            ) : null}
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
