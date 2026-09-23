"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { authorHref } from "@/lib/author-path";
import { cn } from "@/lib/utils";
import type { ArticleSummary } from "@/types/article";
import type { AuthorWithLatestArticle } from "@/lib/authors";
import { SafeMediaImage } from "@/components/ui/SafeMediaImage";

const NAVY = "#0a2f5c";

type Tab = "authors" | "quoted";

function AuthorCard({
  title,
  articleSlug,
  name,
  author,
}: {
  title: string;
  articleSlug: string;
  name: string;
  author?: { id?: string; slug?: string | null; avatarUrl?: string | null } | null;
}) {
  const displayName = name.toLocaleUpperCase("tr-TR");
  const profile = authorHref(author ?? null);

  return (
    <article
      className="flex h-full flex-col bg-[#f3f4f6] px-3 pb-0 pt-4 text-center"
      style={{ borderBottom: `4px solid ${NAVY}` }}
    >
      <Link href={`/haber/${articleSlug}`} className="flex flex-1 flex-col items-center">
        <h3 className="line-clamp-3 min-h-[3.6em] text-[14px] font-medium leading-snug text-ink">
          {title}
        </h3>
        <SafeMediaImage
          src={author?.avatarUrl}
          fallbackName={displayName}
          variant="avatar"
          iconFallback
          className="my-4 h-[88px] w-[88px] rounded-full object-cover ring-2 ring-white"
        />
      </Link>
      {profile ? (
        <Link
          href={profile}
          className="mb-3 text-[12px] font-extrabold uppercase tracking-wide hover:underline"
          style={{ color: NAVY }}
        >
          {displayName}
        </Link>
      ) : (
        <p className="mb-3 text-[12px] font-extrabold uppercase tracking-wide" style={{ color: NAVY }}>
          {displayName}
        </p>
      )}
    </article>
  );
}

export function EditorNewsSection({
  authors,
  quotedArticles = [],
}: {
  authors: AuthorWithLatestArticle[];
  quotedArticles?: ArticleSummary[];
}) {
  const [tab, setTab] = useState<Tab>("authors");
  const hasQuoted = quotedArticles.length > 0;

  if (authors.length === 0 && quotedArticles.length === 0) return null;

  return (
    <section
      className="mt-8 border border-border bg-white"
      aria-label="Yazarlar"
      style={{ borderTop: `4px solid ${NAVY}` }}
    >
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

      {tab === "authors" ? (
        authors.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-ink-soft">Henüz yazar yazısı yok.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-5">
            {authors.slice(0, 5).map((row) => (
              <AuthorCard
                key={row.author.id}
                title={row.article.title}
                articleSlug={row.article.slug}
                name={row.author.name}
                author={row.author}
              />
            ))}
          </div>
        )
      ) : quotedArticles.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-ink-soft">Bu sekmede henüz yazı yok.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 lg:grid-cols-5">
          {quotedArticles.slice(0, 5).map((article) => {
            const name =
              article.reporterName?.trim() ||
              article.author?.name ||
              "Yazar";
            return (
              <AuthorCard
                key={article.id}
                title={article.title}
                articleSlug={article.slug}
                name={name}
                author={article.author}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
