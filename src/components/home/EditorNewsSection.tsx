import Link from "next/link";
import { User } from "lucide-react";
import { LineHeading } from "@/components/home/LineHeading";
import { splitPersonName } from "@/lib/utils";
import type { ArticleSummary } from "@/types/article";
import { authorHref } from "@/lib/author-path";

export function EditorNewsSection({ articles }: { articles: ArticleSummary[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="-mx-4 mt-10 bg-surface px-4 py-8 sm:mx-0 sm:px-6" aria-label="Editör Haberleri">
      <LineHeading title="Editör Haberleri" href="/yazarlar" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {articles.slice(0, 5).map((article) => {
          const name = article.reporterName?.trim() || article.author?.name || "Editör";
          const { first, last } = splitPersonName(name);
          const profile = authorHref(article.author);
          return (
            <article
              key={article.id}
              className="flex h-full flex-col border border-border bg-white p-4 hover:border-brand"
            >
              <Link href={`/haber/${article.slug}`} className="flex flex-1 flex-col">
                <h3 className="line-clamp-3 text-[15px] font-extrabold leading-snug text-ink">
                  {article.title}
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-soft">
                  {article.summary}
                </p>
              </Link>
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                {article.author?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.author.avatarUrl}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink-soft">
                    <User className="h-4 w-4" aria-hidden />
                  </span>
                )}
                {profile ? (
                  <Link href={profile} className="min-w-0 text-xs text-ink hover:text-brand">
                    {first ? <span>{first} </span> : null}
                    <span className="font-extrabold">{last || name}</span>
                  </Link>
                ) : (
                  <p className="min-w-0 text-xs text-ink">
                    {first ? <span>{first} </span> : null}
                    <span className="font-extrabold">{last || name}</span>
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
