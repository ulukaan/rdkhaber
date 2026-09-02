"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, User } from "lucide-react";
import { authorHref } from "@/lib/author-path";
import { cn } from "@/lib/utils";
import type { ArticleSummary } from "@/types/article";

const NAVY = "#0a2f5c";

type Tab = "authors" | "quoted";

function AuthorCard({ article }: { article: ArticleSummary }) {
  const name = (article.reporterName?.trim() || article.author?.name || "Yazar").toLocaleUpperCase(
    "tr-TR",
  );
  const profile = authorHref(article.author);
  const avatar = article.author?.avatarUrl;

  return (
    <article
      className="flex h-full flex-col bg-[#f3f4f6] px-3 pb-0 pt-4 text-center"
      style={{ borderBottom: `4px solid ${NAVY}` }}
    >
      <Link href={`/haber/${article.slug}`} className="flex flex-1 flex-col items-center">
        <h3 className="line-clamp-3 min-h-[3.6em] text-[14px] font-medium leading-snug text-ink">
          {article.title}
        </h3>
        <span className="my-4 flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-white">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <User className="h-10 w-10 text-ink-soft" aria-hidden />
          )}
        </span>
      </Link>
      {profile ? (
        <Link
          href={profile}
          className="mb-3 text-[12px] font-extrabold uppercase tracking-wide hover:underline"
          style={{ color: NAVY }}
        >
          {name}
        </Link>
      ) : (
        <p className="mb-3 text-[12px] font-extrabold uppercase tracking-wide" style={{ color: NAVY }}>
          {name}
        </p>
      )}
    </article>
  );
}

export function EditorNewsSection({
  articles,
  quotedArticles = [],
}: {
  articles: ArticleSummary[];
  quotedArticles?: ArticleSummary[];
}) {
  const [tab, setTab] = useState<Tab>("authors");
  const list = tab === "authors" ? articles : quotedArticles;
  const hasQuoted = quotedArticles.length > 0;

  if (articles.length === 0 && quotedArticles.length === 0) return null;

  return (
    <section className="mt-8 border border-border bg-white" aria-label="Yazarlar" style={{ borderTop: `4px solid ${NAVY}` }}>
      <div className="flex items-center gap-4 border-b border-border px-4 py-3">
        <div className="flex items-center gap-4 text-xs font-extrabold uppercase tracking-wide">
          <button
            type="button"
            onClick={() => setTab("authors")}
            className={cn(tab === "authors" ? "text-brand" : "text-ink-soft hover:text-ink")}
          >
            Yazarlar
          </button>
          {hasQuoted ? (
            <button
              type="button"
              onClick={() => setTab("quoted")}
              className={cn(tab === "quoted" ? "text-brand" : "text-ink-soft hover:text-ink")}
            >
              Alıntı Yazarlar
            </button>
          ) : (
            <Link href="/yazarlar" className="text-ink-soft hover:text-ink">
              Alıntı Yazarlar
            </Link>
          )}
        </div>
        <Link
          href="/yazarlar"
          className="ml-auto text-ink-soft hover:text-brand"
          aria-label="Tüm yazarlar"
        >
          <MoreHorizontal className="h-5 w-5" style={{ color: NAVY }} />
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-ink-soft">Bu sekmede henüz yazı yok.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-5">
          {list.slice(0, 5).map((article) => (
            <AuthorCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </section>
  );
}
