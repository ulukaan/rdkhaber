import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getArticleBySlug,
  getRelatedArticles,
  getMostCommentedArticles,
  getMostReadArticles,
  getTrendingArticles,
  getLatestArticles,
  getBreakingArticles,
  getRandomSpotlightArticles,
  incrementViewCount,
} from "@/lib/articles";
import { getSettings } from "@/lib/settings";
import { getRates, pickParityItems } from "@/lib/rates";
import { getPrayerTimes } from "@/lib/prayer-times";
import { Container } from "@/components/ui/Container";
import { CoverImage } from "@/components/news/CoverImage";
import { ArticleBody } from "@/components/news/ArticleBody";
import { VideoEmbed } from "@/components/news/VideoEmbed";
import { CommentSection } from "@/components/news/CommentSection";
import { readingTimeMinutes } from "@/lib/utils";
import { AdUnit } from "@/components/ads/AdUnit";
import { ArticleMetaBar } from "@/components/news/ArticleMetaBar";
import { ShareBar } from "@/components/news/ShareBar";
import { TipCallout } from "@/components/news/TipCallout";
import { ArticleContinueFeed } from "@/components/news/ArticleContinueFeed";
import { ArticleSidebar } from "@/components/news/ArticleSidebar";
import { ArticleCategoryChrome } from "@/components/news/ArticleCategoryChrome";
import { ArticleImageGallery } from "@/components/news/ArticleImageGallery";
import { AuthorByline } from "@/components/news/AuthorByline";
import { sanitizeArticleHtml } from "@/lib/article-html";
import { authorHref } from "@/lib/authors";
import { buildNewsArticleJsonLd } from "@/lib/json-ld";
import { RecordArticleRead } from "@/components/account/RecordArticleRead";
import { CorrectionBanner } from "@/components/news/CorrectionBanner";
import { LiveBlogTimeline } from "@/components/news/LiveBlogTimeline";
import { PushSubscribeButton } from "@/components/pwa/PushSubscribeButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Haber Bulunamadı" };
  return {
    title: article.seoTitle?.trim() || article.title,
    description: article.seoDescription?.trim() || article.summary,
    keywords: article.seoKeywords?.trim() || undefined,
    alternates: {
      canonical: `/haber/${article.slug}`,
    },
    openGraph: {
      type: "article",
      title: article.seoTitle?.trim() || article.title,
      description: article.seoDescription?.trim() || article.summary,
      images: article.coverImageUrl ? [article.coverImageUrl] : undefined,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.author.name],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  incrementViewCount(article.id).catch(() => {});

  const [related, mostRead, trending, mostCommented, settings, latest, breaking, rates, prayers] =
    await Promise.all([
    getRelatedArticles(article.category.slug, article.id, 6),
    getMostReadArticles(8),
    getTrendingArticles(8),
    getMostCommentedArticles(8),
    getSettings(),
    getLatestArticles(8),
    getBreakingArticles(5),
    getRates(),
    getPrayerTimes(),
  ]);

  const excludeIds = [article.id];
  const feedRows = await getRandomSpotlightArticles(excludeIds, 1);
  const feedInitial = await Promise.all(
    feedRows.map(async (row) => {
      const relatedForRow = await getRelatedArticles(row.category.slug, row.id, 5);
      return {
        ...row,
        content: sanitizeArticleHtml(row.content),
        publishedAt: row.publishedAt?.toISOString() ?? null,
        related: relatedForRow.map((r) => ({
          ...r,
          publishedAt: r.publishedAt?.toISOString() ?? null,
        })),
      };
    }),
  );

  const articleUrl = `/haber/${article.slug}`;
  const minutes = readingTimeMinutes(article.content);
  const byline = (article.reporterName?.trim() || article.author?.name?.trim() || "").trim();
  const authorProfileHref = authorHref(article.author);
  const parityItems = rates ? pickParityItems(rates) : [];

  const latestForSidebar = (
    breaking.length > 0
      ? [...breaking, ...latest.filter((a) => !breaking.some((b) => b.id === a.id))]
      : latest
  )
    .filter((a) => a.id !== article.id)
    .slice(0, 5);

  const relatedForSidebar = related.filter((a) => a.id !== article.id);
  const mostReadForSidebar = mostRead.filter((a) => a.id !== article.id);
  const trendingForSidebar = trending.filter((a) => a.id !== article.id);
  const mostCommentedForSidebar = mostCommented.filter((a) => a.id !== article.id);

  const jsonLd = buildNewsArticleJsonLd({
    title: article.title,
    summary: article.summary,
    slug: article.slug,
    coverImageUrl: article.coverImageUrl,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    authorName: byline || article.author.name,
    siteName: settings.siteName,
    keywords: [
      ...article.tags.map((t) => t.name),
      ...(article.seoKeywords?.split(",").map((k) => k.trim()).filter(Boolean) ?? []),
    ],
  });

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header
        id="article-main"
        data-url={articleUrl}
        data-title={article.title}
        className="border-b border-border bg-white"
      >
        <Container className="pt-5 pb-1">
          <ArticleCategoryChrome
            name={article.category.name}
            slug={article.category.slug}
            color={article.category.color}
          />

          <AdUnit code="131" />

          <h1 className="mt-4 text-[1.75rem] font-black tracking-tight text-ink md:text-[2.35rem] md:leading-[1.2]">
            {article.title}
          </h1>

          <AdUnit code="1000" />

          {article.summary ? (
            <p className="mt-4 border-l-4 border-brand pl-4 text-base leading-relaxed text-ink-soft md:text-[1.08rem]">
              {article.summary}
            </p>
          ) : null}

          {byline ? <AuthorByline name={byline} author={article.author} /> : null}
        </Container>

        <ArticleMetaBar
          publishedAt={article.publishedAt ?? article.createdAt}
          minutes={minutes}
          authorName={byline}
          authorHref={authorProfileHref}
          shareUrl={articleUrl}
          shareTitle={article.title}
          viewCount={article.viewCount}
          articleId={article.id}
        />
        <RecordArticleRead articleId={article.id} />
        <AdUnit code="1001" />
      </header>

      <Container className="py-7">
        <CorrectionBanner corrections={article.corrections} />
        {article.isLiveBlog ? <LiveBlogTimeline updates={article.liveUpdates} /> : null}
        <div className="mb-4">
          <PushSubscribeButton />
        </div>
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
                  priority
                  className="aspect-[16/9] w-full md:aspect-[860/504]"
                  sizes="(max-width: 1280px) 100vw, 860px"
                />
              )}
            </div>

            {article.images.length > 0 ? (
              <ArticleImageGallery
                images={article.images}
                color={article.category.color}
                title={article.title}
              />
            ) : null}

            <AdUnit code="128" />

            <div className="mt-7 rounded-none border border-border bg-white px-4 py-6 sm:px-7 sm:py-8">
              <ArticleBody content={article.content} />
            </div>

            <AdUnit code="1004" />
            <AdUnit code="138" />

            <ShareBar url={articleUrl} title={article.title} articleId={article.id} />

            {article.tags.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
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

            <TipCallout whatsappNumber={settings.whatsappNumber} />
            <AdUnit code="134" />
            <CommentSection articleId={article.id} />
          </div>

          <ArticleSidebar
            related={relatedForSidebar}
            mostRead={mostReadForSidebar}
            trending={trendingForSidebar}
            mostCommented={mostCommentedForSidebar}
            latest={latestForSidebar}
            categoryName={article.category.name}
            categorySlug={article.category.slug}
            parityItems={settings.showParity !== "0" ? parityItems : []}
            prayers={settings.showImsakiye !== "0" ? prayers : null}
          />
        </div>
      </Container>

      <ArticleContinueFeed
        excludeIds={[article.id]}
        initial={feedInitial}
        whatsappNumber={settings.whatsappNumber}
        sidebar={{
          mostRead: mostReadForSidebar,
          trending: trendingForSidebar,
          mostCommented: mostCommentedForSidebar,
          latest: latestForSidebar,
          parityItems: settings.showParity !== "0" ? parityItems : [],
          prayers: settings.showImsakiye !== "0" ? prayers : null,
        }}
      />
    </article>
  );
}
