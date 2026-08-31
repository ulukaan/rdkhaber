"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { CoverImage } from "@/components/news/CoverImage";
import { VideoEmbed } from "@/components/news/VideoEmbed";
import { ShareBar } from "@/components/news/ShareBar";
import { ArticleMetaBar } from "@/components/news/ArticleMetaBar";
import { ArticleImageGallery } from "@/components/news/ArticleImageGallery";
import { ArticleSidebarPanels } from "@/components/news/ArticleSidebarPanels";
import { TipCallout } from "@/components/news/TipCallout";
import { AuthorByline } from "@/components/news/AuthorByline";
import { RecordArticleRead } from "@/components/account/RecordArticleRead";
import { CommentForm } from "@/components/forms/CommentForm";
import { readingTimeMinutes, formatRelativeTime, cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import { categoryHref } from "@/lib/category-path";
import { authorHref } from "@/lib/author-path";
import type { ArticleSummary } from "@/types/article";
import type { MarketItem } from "@/lib/rates";
import type { PrayerDay } from "@/lib/prayer-times";

export type ContinueArticle = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  videoUrl?: string | null;
  publishedAt: string | Date | null;
  viewCount?: number;
  reporterName?: string | null;
  category: { name: string; slug: string; color: string | null };
  author?: { id?: string; name: string; slug?: string | null; avatarUrl?: string | null } | null;
  tags?: Array<{ name: string; slug: string }>;
  images?: Array<{ id: string; imageUrl: string; caption: string | null }>;
  related?: ArticleSummary[];
};

type ContinueSidebar = {
  mostRead: ArticleSummary[];
  trending?: ArticleSummary[];
  mostCommented?: ArticleSummary[];
  latest: ArticleSummary[];
  parityItems: MarketItem[];
  prayers: PrayerDay | null;
};

const proseClass =
  "space-y-4 text-[17px] leading-relaxed text-ink [&_blockquote]:border-l-4 [&_blockquote]:border-brand [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-ink-soft [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-extrabold [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_a]:text-brand [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_img]:h-auto [&_img]:max-w-full [&_figure]:my-4";

type CommentRow = {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
};

function ContinueComments({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<CommentRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/yorumlar?articleId=${encodeURIComponent(articleId)}`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data: { items?: CommentRow[] }) => {
        if (!cancelled) setComments(data.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      });
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  return (
    <section
      className="mt-10 border border-border bg-white p-5 sm:p-6"
      aria-labelledby={`comments-${articleId}`}
    >
      <h2
        id={`comments-${articleId}`}
        className="mb-2 flex items-center gap-2 text-lg font-extrabold text-ink"
      >
        <MessageSquare className="h-5 w-5 text-brand" aria-hidden />
        Yorumlar {comments.length > 0 ? `(${comments.length})` : ""}
      </h2>
      <p className="mb-5 text-sm text-ink-soft">
        Üye veya ziyaretçi olarak yorum yazabilirsiniz.
      </p>
      <CommentForm articleId={articleId} />
      {comments.length === 0 ? (
        <p className="mt-6 border border-dashed border-border bg-surface px-4 py-6 text-sm text-ink-soft">
          Henüz yorum yok. İlk yorumu siz yazın.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col divide-y divide-border border-t border-border">
          {comments.map((c) => (
            <li key={c.id} className="py-4">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-ink">{c.authorName}</span>
                <span className="text-xs text-ink-soft">{formatRelativeTime(c.createdAt)}</span>
              </div>
              <p className="text-sm leading-relaxed text-ink-soft">{c.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ContinueArticleBlock({
  article,
  whatsappNumber,
  sidebar,
  index,
}: {
  article: ContinueArticle;
  whatsappNumber: string;
  sidebar: ContinueSidebar;
  index: number;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const byline = (article.reporterName?.trim() || article.author?.name?.trim() || "").trim();
  const authorProfileHref = authorHref(article.author);
  const minutes = readingTimeMinutes(article.content);
  const bg = article.category.color || "var(--brand)";
  const articleUrl = `/haber/${article.slug}`;
  const tags = article.tags ?? [];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || entry.intersectionRatio < 0.28) return;
        if (window.location.pathname !== articleUrl) {
          window.history.replaceState(null, "", articleUrl);
          document.title = `${article.title} | Düzce Radikal`;
        }
        window.dispatchEvent(
          new CustomEvent("continue-article-active", {
            detail: {
              name: article.category.name,
              slug: article.category.slug,
              color: article.category.color,
            },
          }),
        );
      },
      { threshold: [0.28] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [article, articleUrl]);

  return (
    <article
      ref={rootRef}
      data-slug={article.slug}
      className={cn("article-continue-item border-t border-border", index === 0 && "mt-10")}
    >
      <header className="border-b border-border bg-white">
        <Container className="pt-5 pb-1">
          <Link
            href={categoryHref(article.category.slug)}
            className="inline-flex items-center px-3 py-1.5 text-[12px] font-extrabold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: bg }}
          >
            {article.category.name}
          </Link>

          <h2 className="mt-4 text-[1.75rem] font-black tracking-tight text-ink md:text-[2.35rem] md:leading-[1.2]">
            {article.title}
          </h2>

          {article.summary ? (
            <p className="mt-4 border-l-4 border-brand pl-4 text-base leading-relaxed text-ink-soft md:text-[1.08rem]">
              {article.summary}
            </p>
          ) : null}

          {byline ? <AuthorByline name={byline} author={article.author} /> : null}
        </Container>

        {article.publishedAt ? (
          <ArticleMetaBar
            publishedAt={article.publishedAt}
            minutes={minutes}
            authorName={byline}
            authorHref={authorProfileHref}
            shareUrl={articleUrl}
            shareTitle={article.title}
            viewCount={article.viewCount}
            articleId={article.id}
          />
        ) : null}
        <RecordArticleRead articleId={article.id} />
      </header>

      <Container className="py-7">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-10">
          <div className="min-w-0">
            <div className="overflow-hidden border border-border bg-white">
              {article.videoUrl ? (
                <VideoEmbed url={article.videoUrl} />
              ) : (
                <CoverImage
                  src={article.coverImageUrl}
                  alt={article.title}
                  color={article.category.color}
                  className="aspect-[16/9] w-full md:aspect-[860/504]"
                  sizes="(max-width: 1280px) 100vw, 860px"
                />
              )}
            </div>

            {article.images && article.images.length > 0 ? (
              <ArticleImageGallery
                images={article.images}
                color={article.category.color}
                title={article.title}
              />
            ) : null}

            <div className="mt-7 rounded-none border border-border bg-white px-4 py-6 sm:px-7 sm:py-8">
              <div
                className={proseClass + " article-html"}
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>

            <ShareBar url={articleUrl} title={article.title} articleId={article.id} />

            {tags.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/arama?q=${encodeURIComponent(tag.name)}`}
                    className="border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-brand hover:text-brand"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            ) : null}

            <TipCallout whatsappNumber={whatsappNumber} />
            <ContinueComments articleId={article.id} />
          </div>

          <div className="xl:sticky xl:top-24 xl:self-start">
            <ArticleSidebarPanels
              related={(article.related ?? []).filter((a) => a.id !== article.id)}
              mostRead={sidebar.mostRead.filter((a) => a.id !== article.id)}
              trending={(sidebar.trending ?? []).filter((a) => a.id !== article.id)}
              mostCommented={(sidebar.mostCommented ?? []).filter((a) => a.id !== article.id)}
              latest={sidebar.latest.filter((a) => a.id !== article.id)}
              categoryName={article.category.name}
              categorySlug={article.category.slug}
              parityItems={sidebar.parityItems}
              prayers={sidebar.prayers}
            />
          </div>
        </div>
      </Container>
    </article>
  );
}

export function ArticleContinueFeed({
  excludeIds,
  initial,
  whatsappNumber,
  sidebar,
}: {
  excludeIds: string[];
  initial: ContinueArticle[];
  whatsappNumber: string;
  sidebar: ContinueSidebar;
}) {
  const [items, setItems] = useState(initial);
  const [seen, setSeen] = useState(
    () => new Set([...excludeIds, ...initial.map((a) => a.id)]),
  );
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        take: "1",
        exclude: Array.from(seen).join(","),
      });
      const res = await fetch(`/api/haberler/devam?${params.toString()}`);
      if (!res.ok) {
        setHasMore(false);
        return;
      }
      const data = (await res.json()) as { items: ContinueArticle[]; hasMore: boolean };
      if (data.items.length === 0) {
        setHasMore(false);
        return;
      }
      setItems((prev) => [...prev, ...data.items]);
      setSeen((prev) => {
        const next = new Set(prev);
        for (const a of data.items) next.add(a.id);
        return next;
      });
      setHasMore(Boolean(data.hasMore));
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, seen]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "420px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (items.length === 0 && !hasMore) return null;

  return (
    <section aria-label="Devam eden haberler">
      {items.map((article, i) => (
        <ContinueArticleBlock
          key={article.id}
          article={article}
          whatsappNumber={whatsappNumber}
          sidebar={sidebar}
          index={i}
        />
      ))}
      <div ref={sentinel} className="h-16" aria-hidden />
      {loading ? (
        <p className="py-8 text-center text-sm text-ink-soft">Sonraki haber yükleniyor…</p>
      ) : null}
    </section>
  );
}
