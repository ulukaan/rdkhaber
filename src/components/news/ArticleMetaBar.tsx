"use client";

import { Calendar, Clock, Eye } from "lucide-react";
import { ShareButtons } from "@/components/news/ShareButtons";
import { BookmarkButton } from "@/components/account/BookmarkButton";
import { ArticleListenButton } from "@/components/news/ArticleListenButton";
import { Container } from "@/components/ui/Container";
import { formatNewsDate } from "@/lib/utils";

export function ArticleMetaBar({
  publishedAt,
  minutes,
  shareUrl,
  shareTitle,
  viewCount,
  articleId,
  listenText,
}: {
  publishedAt: Date | string;
  minutes: number;
  authorName: string;
  authorHref?: string | null;
  shareUrl: string;
  shareTitle: string;
  viewCount?: number;
  articleId?: string;
  listenText?: string;
}) {
  const items = [
    { icon: Calendar, value: formatNewsDate(publishedAt), label: "Yayınlanma" },
    { icon: Clock, value: `${minutes} dk`, label: "Okuma süresi" },
    ...(typeof viewCount === "number" && viewCount > 0
      ? [{ icon: Eye, value: String(viewCount), label: "Okunma" }]
      : []),
  ];

  return (
    <div className="mt-5 border-y border-border bg-surface">
      <Container className="flex items-center gap-4 py-2.5">
        <ul className="flex min-w-0 flex-1 items-center gap-x-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item, i) => (
            <li key={item.label} className="flex shrink-0 items-center gap-3">
              {i > 0 ? (
                <span className="text-border" aria-hidden>
                  ·
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5" title={item.label}>
                <item.icon className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
                <span className="text-[13px] font-semibold text-ink">{item.value}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="flex shrink-0 items-center gap-1.5">
          {listenText ? <ArticleListenButton text={listenText} /> : null}
          {articleId ? <BookmarkButton articleId={articleId} variant="icon" /> : null}
          <ShareButtons url={shareUrl} title={shareTitle} />
        </div>
      </Container>
    </div>
  );
}
