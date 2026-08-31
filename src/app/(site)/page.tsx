import { getCategoriesWithChildren } from "@/lib/categories";
import {
  getFeaturedArticles,
  getLatestArticles,
  getMostBookmarkedArticles,
  getMostCommentedArticles,
  getMostReadArticles,
  getTrendingArticles,
  getVideoArticles,
  getArticlesByCategory,
  getEditorArticles,
  getBreakingArticles,
} from "@/lib/articles";
import { getGalleries } from "@/lib/galleries";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TopHeadlineRow } from "@/components/news/TopHeadlineRow";
import { FeaturedBlock } from "@/components/news/FeaturedBlock";
import { NewsCard } from "@/components/news/NewsCard";
import { CategorySpotlight } from "@/components/news/CategorySpotlight";
import { VideoCard } from "@/components/news/VideoCard";
import { AdUnit } from "@/components/ads/AdUnit";
import { getActiveAd } from "@/lib/ads";
import { getSettings, parseCategoryBlocks, parseSlugList, parseParityDesign, parseImsakiyeDesign } from "@/lib/settings";
import { getRates, pickParityItems } from "@/lib/rates";
import { getPrayerTimes } from "@/lib/prayer-times";
import { getDailyHoroscopes } from "@/lib/horoscope";
import { getBroadcastItems } from "@/lib/broadcast";
import { DayHeadlinesSection } from "@/components/home/DayHeadlinesSection";
import { CategoryBandSection } from "@/components/home/CategoryBandSection";
import { CategoryNewsBlocks } from "@/components/home/CategoryNewsBlocks";
import { InterviewSection } from "@/components/home/InterviewSection";
import { PhotoGallerySection } from "@/components/home/PhotoGallerySection";
import { EditorNewsSection } from "@/components/home/EditorNewsSection";
import { ParityStrip } from "@/components/home/ParityStrip";
import { ImsakiyeBar } from "@/components/home/ImsakiyeBar";
import { HoroscopeStrip } from "@/components/home/HoroscopeStrip";
import { BroadcastStrip } from "@/components/home/BroadcastStrip";
import { LiveScoreStrip } from "@/components/home/LiveScoreStrip";
import { getLiveScores } from "@/lib/livescore";
import { categoryHref } from "@/lib/category-path";
import { getLatestInstagramPost } from "@/lib/instagram";
import { InstagramLatestCard } from "@/components/home/InstagramLatestCard";

export const revalidate = 60;

export default async function HomePage() {
  const settings = await getSettings();

  const needRates = settings.showParity !== "0" || settings.showRates !== "0";
  const needPrayer = settings.showImsakiye !== "0";
  const needHoroscope = settings.showHoroscope !== "0";
  const needBroadcast = settings.showBroadcast !== "0";
  const needLiveScore = settings.showLiveScore !== "0";
  const needCards = settings.showCategoryCards !== "0";
  const needSpotlight = settings.showCategorySpotlight !== "0";
  const instagramProfile = settings.instagramUrl?.trim();

  const [
    featured,
    latest,
    mostRead,
    trendingWeek,
    mostCommented,
    mostBookmarked,
    videos,
    categories,
    gundem,
    interviewsRaw,
    galleries,
    editors,
    breaking,
    rates,
    prayers,
    horoscopes,
    broadcastItems,
    liveScores,
    featuredRailAd,
    instagramPost,
  ] = await Promise.all([
    getFeaturedArticles(12),
    getLatestArticles(24),
    settings.showMostRead !== "0" ? getMostReadArticles(6) : Promise.resolve([]),
    settings.showTrendingWeek !== "0" ? getTrendingArticles(6) : Promise.resolve([]),
    settings.showMostCommented !== "0" ? getMostCommentedArticles(6) : Promise.resolve([]),
    settings.showMostBookmarked !== "0" ? getMostBookmarkedArticles(6) : Promise.resolve([]),
    settings.showVideos !== "0" ? getVideoArticles(6) : Promise.resolve([]),
    getCategoriesWithChildren(),
    getArticlesByCategory("gundem", 5),
    settings.showInterviews !== "0"
      ? getArticlesByCategory("roportaj", 4)
      : Promise.resolve([]),
    settings.showPhotoGallery !== "0" ? getGalleries(3) : Promise.resolve([]),
    settings.showEditorNews !== "0" ? getEditorArticles(5) : Promise.resolve([]),
    settings.showTopHeadlines !== "0" || settings.showFeatured !== "0"
      ? getBreakingArticles(5)
      : Promise.resolve([]),
    needRates ? getRates() : Promise.resolve(null),
    needPrayer ? getPrayerTimes() : Promise.resolve(null),
    needHoroscope ? getDailyHoroscopes() : Promise.resolve([]),
    needBroadcast ? getBroadcastItems({ limit: 6 }) : Promise.resolve([]),
    needLiveScore ? getLiveScores() : Promise.resolve(null),
    getActiveAd("069"),
    instagramProfile
      ? getLatestInstagramPost(instagramProfile)
      : Promise.resolve(null),
  ]);

  const interviews =
    interviewsRaw.length > 0
      ? interviewsRaw
      : await getArticlesByCategory("kultur-sanat", 4).then((rows) =>
          rows.length > 0 ? rows : latest.slice(0, 4),
        );

  const galleryItems =
    galleries.length > 0
      ? galleries.map((g) => ({
          slug: g.slug,
          title: g.title,
          coverImageUrl: g.coverImageUrl || g.images[0]?.imageUrl || null,
          href: `/foto-galeri/${g.slug}`,
        }))
      : latest.slice(0, 3).map((a) => ({
          slug: a.slug,
          title: a.title,
          coverImageUrl: a.coverImageUrl,
          href: `/haber/${a.slug}`,
        }));

  const sliderPool = [
    ...featured,
    ...latest.filter((a) => !featured.some((f) => f.id === a.id)),
  ];
  const slides = sliderPool.slice(0, 12);
  const secondary = sliderPool.filter((a) => a.id !== slides[0]?.id).slice(0, 2);
  const topHeadlines = (
    breaking.length >= 5
      ? breaking
      : [...breaking, ...latest.filter((a) => !breaking.some((b) => b.id === a.id))]
  ).slice(0, 5);

  const usedIds = new Set(
    [...slides, ...secondary, ...topHeadlines].map((a) => a.id),
  );

  const takeUnused = <T extends { id: string }>(list: T[], n: number) => {
    const out: T[] = [];
    for (const item of list) {
      if (usedIds.has(item.id)) continue;
      out.push(item);
      usedIds.add(item.id);
      if (out.length >= n) break;
    }
    return out;
  };

  const dayHeadlines = takeUnused(latest, 5);
  const gundemUnique = takeUnused(gundem, 5);
  const editorsUnique = takeUnused(editors, 5);
  const interviewsUnique = takeUnused(interviews, 4);
  const latestFeed = latest.filter((a) => !usedIds.has(a.id));

  /** Üst kategori kartlarında alt kategorilerin (ilçe / parti) haberlerini de say */
  const childSlugsFor = (slug: string, children: Array<{ slug: string }>) => {
    const direct = children.map((ch) => ch.slug);
    if (slug === "bolge") {
      const bolgeKat = categories.find((c) => c.slug === "bolge-kategorileri");
      return [...new Set([...direct, ...(bolgeKat?.children.map((ch) => ch.slug) ?? [])])];
    }
    if (slug === "siyaset" || slug === "siyasi-partiler") {
      const parties = categories.find((c) => c.slug === "siyasi-partiler");
      return [
        ...new Set([
          ...direct,
          ...(parties?.children.map((ch) => ch.slug) ?? []),
          "siyaset",
        ]),
      ].filter((s) => s !== slug);
    }
    return direct;
  };

  const selectedBlocks = parseCategoryBlocks(settings.categoryCardSlugs);
  const cardOrder =
    selectedBlocks.length > 0
      ? selectedBlocks
      : categories.slice(0, 3).map((c, i) => ({
          slug: c.slug,
          layout: (["3", "4", "5"] as const)[i % 3],
        }));

  const spotlightOrder = parseSlugList(settings.categorySpotlightSlugs);
  const neededSlugs = new Set<string>();
  if (needCards) {
    for (const block of cardOrder) neededSlugs.add(block.slug);
  }
  if (needSpotlight) {
    if (spotlightOrder.length > 0) {
      for (const slug of spotlightOrder) neededSlugs.add(slug);
    } else {
      // Spotlight varsayılanı: tüm kategorileri çekme — ilk 8 yeter
      for (const c of categories.slice(0, 8)) neededSlugs.add(c.slug);
    }
  }

  const neededCategories = categories.filter((c) => neededSlugs.has(c.slug));
  const categorySections = await Promise.all(
    neededCategories.map(async (c) => ({
      category: c,
      articles: await getArticlesByCategory(c.slug, 5, 0, {
        childSlugs: childSlugsFor(c.slug, c.children),
      }),
    })),
  );

  const categoryNews = cardOrder
    .map((block) => {
      const section = categorySections.find((s) => s.category.slug === block.slug);
      if (!section) return null;
      return {
        name: section.category.name,
        slug: section.category.slug,
        color: section.category.color,
        layout: block.layout,
        articles: section.articles,
      };
    })
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const parityItems = rates ? pickParityItems(rates) : [];

  // Manşetten sonra kategori kartlarında zaten Gündem varsa bantı tekrarlamayalım
  const gundemInCards = categoryNews.some((b) => b.slug === "gundem");
  const categoryLead = categoryNews.slice(0, 3);
  const categoryRest = categoryNews.slice(3);

  return (
    <Container className="py-4">
      <h1 className="sr-only">
        {settings.siteName}
        {settings.siteSlogan ? ` — ${settings.siteSlogan}` : ""}
      </h1>
      {/* 1) Haber omurgası */}
      {settings.showTopHeadlines !== "0" ? <TopHeadlineRow articles={topHeadlines} /> : null}
      <AdUnit code="068" />
      {settings.showFeatured !== "0" && slides.length > 0 && (
        <FeaturedBlock
          slides={slides}
          secondary={secondary}
          rail={
            featuredRailAd ? <AdUnit code="069" className="h-full py-0" /> : undefined
          }
        />
      )}
      <AdUnit code="070" className="lg:hidden" />
      <AdUnit code="151" />

      {/* 2) Kısa araçlar — üstte sadece kompakt olanlar */}
      {settings.showParity !== "0" && parityItems.length > 0 ? (
        <ParityStrip items={parityItems} design={parseParityDesign(settings.parityDesign)} />
      ) : null}
      {settings.showLiveScore !== "0" && liveScores && liveScores.matches.length > 0 ? (
        <LiveScoreStrip data={liveScores} />
      ) : null}

      {/* 3) Haber — önce günün manşeti + ilk kategori grubu */}
      {settings.showDayHeadlines !== "0" ? <DayHeadlinesSection articles={dayHeadlines} /> : null}
      {settings.showCategoryCards !== "0" && categoryLead.length > 0 ? (
        <CategoryNewsBlocks blocks={categoryLead} />
      ) : null}
      {settings.showGundemBand !== "0" && !gundemInCards ? (
        <CategoryBandSection title="Gündem" href={categoryHref("gundem")} articles={gundemUnique} />
      ) : null}

      {/* 4) Nefes: röportaj + galeri */}
      {settings.showInterviews !== "0" ? (
        <InterviewSection
          articles={interviewsUnique}
          href={interviewsRaw.length > 0 ? categoryHref("roportaj") : categoryHref("kultur-sanat")}
        />
      ) : null}
      {settings.showPhotoGallery !== "0" ? <PhotoGallerySection items={galleryItems} /> : null}

      {/* 5) Kalan kategoriler + editör */}
      {settings.showCategoryCards !== "0" && categoryRest.length > 0 ? (
        <CategoryNewsBlocks blocks={categoryRest} />
      ) : null}
      {settings.showEditorNews !== "0" ? <EditorNewsSection articles={editorsUnique} /> : null}

      {/* 6) Günlük / yaşam servisleri */}
      {settings.showImsakiye !== "0" && prayers ? (
        <ImsakiyeBar day={prayers} design={parseImsakiyeDesign(settings.imsakiyeDesign)} />
      ) : null}
      {settings.showHoroscope !== "0" && horoscopes.length > 0 ? (
        <HoroscopeStrip items={horoscopes} />
      ) : null}
      {settings.showBroadcast !== "0" && broadcastItems.length > 0 ? (
        <BroadcastStrip items={broadcastItems} />
      ) : null}

      {/* 7) Akış + yan sütun */}
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-10">
          {settings.showLatestFeed !== "0" && latestFeed.length > 0 && (
            <section>
              <SectionHeading title="Güncel Haberler" href={categoryHref("gundem")} />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {latestFeed.map((a) => (
                  <NewsCard key={a.id} article={a} variant="poster" />
                ))}
              </div>
            </section>
          )}

          {settings.showCategorySpotlight !== "0" ? (
            <CategorySpotlight
              tabs={(() => {
                const sections =
                  spotlightOrder.length > 0
                    ? spotlightOrder
                        .map((slug) => categorySections.find((s) => s.category.slug === slug))
                        .filter((s): s is NonNullable<typeof s> => Boolean(s))
                    : categorySections;
                return sections.map(({ category, articles }) => ({
                  name: category.name,
                  slug: category.slug,
                  color: category.color,
                  articles,
                }));
              })()}
            />
          ) : null}

          <AdUnit code="150" />

          {settings.showVideos !== "0" && videos.length > 0 && (
            <section>
              <SectionHeading title="Video Haberler" href="/video-haberler" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {videos.slice(0, 3).map((a) => (
                  <VideoCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <AdUnit code="069" className="py-0" />
          {instagramPost ? <InstagramLatestCard post={instagramPost} /> : null}
          <AdUnit code="300" className="py-0" />
          {settings.showMostRead !== "0" ? (
            <div className="border border-border bg-white p-4">
              <SectionHeading title="Çok Okunanlar" href="/enler#cok-okunanlar" className="mb-2" />
              <div>
                {mostRead.map((a, i) => (
                  <NewsCard key={a.id} article={a} variant="compact" rank={i + 1} />
                ))}
              </div>
            </div>
          ) : null}
          {settings.showTrendingWeek !== "0" && trendingWeek.length > 0 ? (
            <div className="border border-border bg-white p-4">
              <SectionHeading title="Haftanın Trendi" href="/enler#haftanin-trendi" className="mb-2" />
              <div>
                {trendingWeek.map((a, i) => (
                  <NewsCard key={a.id} article={a} variant="compact" rank={i + 1} />
                ))}
              </div>
            </div>
          ) : null}
          {settings.showMostCommented !== "0" && mostCommented.length > 0 ? (
            <div className="border border-border bg-white p-4">
              <SectionHeading
                title="En Çok Yorumlanan"
                href="/enler#en-cok-yorumlanan"
                className="mb-2"
              />
              <div>
                {mostCommented.map((a, i) => (
                  <NewsCard key={a.id} article={a} variant="compact" rank={i + 1} />
                ))}
              </div>
            </div>
          ) : null}
          {settings.showMostBookmarked !== "0" && mostBookmarked.length > 0 ? (
            <div className="border border-border bg-white p-4">
              <SectionHeading
                title="En Çok Kaydedilen"
                href="/enler#en-cok-kaydedilen"
                className="mb-2"
              />
              <div>
                {mostBookmarked.map((a, i) => (
                  <NewsCard key={a.id} article={a} variant="compact" rank={i + 1} />
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </Container>
  );
}
