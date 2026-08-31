"use client";

import Link from "next/link";
import { Calendar, Clock, Eye, User } from "lucide-react";
import { ShareButtons } from "@/components/news/ShareButtons";
import { BookmarkButton } from "@/components/account/BookmarkButton";
import { formatNewsDate } from "@/lib/utils";

export function ArticleMetaBar({
  publishedAt,
  minutes,
  authorName,
  authorHref,
  shareUrl,
  shareTitle,
  viewCount,
  articleId,
}: {
  publishedAt: Date | string;
  minutes: number;
  authorName: string;
  authorHref?: string | null;
  shareUrl: string;
  shareTitle: string;
  viewCount?: number;
  articleId?: string;
}) {
  const items = [
    { icon: Calendar, value: formatNewsDate(publishedAt), label: "Yayınlanma", href: null as string | null },
    { icon: Clock, value: `${minutes} dk`, label: "Okuma süresi", href: null },
    ...(authorName.trim()
      ? [{ icon: User, value: authorName, label: "Yazar" as const, href: authorHref ?? null }]
      : []),
    ...(typeof viewCount === "number" && viewCount > 0
      ? [{ icon: Eye, value: String(viewCount), label: "Okunma" as const, href: null }]
      : []),
  ];

  return (
    <div className="mt-5 border-y border-border bg-surface">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-3.5">
        <ul className="flex flex-wrap items-center gap-x-1 gap-y-2">
          {items.map((item, i) => (
            <li key={item.label} className="flex items-center">
              {i > 0 ? (
                <span className="mx-3 hidden h-8 w-px bg-border sm:block" aria-hidden />
              ) : null}
              <item.icon className="mr-2 h-4 w-4 shrink-0 text-brand" aria-hidden />
              <div>
                {item.href ? (
                  <Link href={item.href} className="text-[13px] font-bold leading-none text-ink hover:text-brand">
                    {item.value}
                  </Link>
                ) : (
                  <p className="text-[13px] font-bold leading-none text-ink">{item.value}</p>
                )}
                <p className="mt-1 text-[11px] text-ink-soft">{item.label}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          {articleId ? <BookmarkButton articleId={articleId} /> : null}
          <span className="hidden text-[11px] font-bold uppercase tracking-wide text-ink-soft sm:inline">
            Paylaş
          </span>
          <ShareButtons url={shareUrl} title={shareTitle} />
        </div>
      </div>
    </div>
  );
}
