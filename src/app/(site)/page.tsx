import { getCategoriesWithChildren } from "@/lib/categories";
import {
  getFeaturedArticles,
  getSurmansetArticles,
  getLatestArticles,
  getMostBookmarkedArticles,
  getMostCommentedArticles,
  getMostReadArticles,
  getTrendingArticles,
  getVideoArticles,
  getArticlesByCategory,
  getQuotedAuthorArticles,
  getBreakingArticles,
} from "@/lib/articles";
import { getAuthorsWithLatestArticle } from "@/lib/authors";
import { getGalleries } from "@/lib/galleries";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TopHeadlineRow } from "@/components/news/TopHeadlineRow";
import { FeaturedBlock } from "@/components/news/FeaturedBlock";
import { SurmansetBanner } from "@/components/news/SurmansetBanner";
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
import { PollWidget } from "@/components/news/PollWidget";
import { SidebarWeather } from "@/components/news/SidebarWeather";
import { SidebarPrayerTimes } from "@/components/news/SidebarPrayerTimes";
import { SidebarPharmacy } from "@/components/news/SidebarPharmacy";
import { SidebarOfficialAds } from "@/components/news/SidebarOfficialAds";
import { SidebarLeagueTable } from "@/components/news/SidebarLeagueTable";
import { getActiveHomepagePoll, getPollStateForServer } from "@/actions/poll-vote";
import { auth } from "@/auth";
import { getPersonalizedArticles } from "@/lib/personalized";
import { ForYouSection } from "@/components/news/ForYouSection";
import { safeLoad } from "@/lib/safe-load";
import { cookies } from "next/headers";
import { CITY_COOKIE, resolveCity } from "@/lib/cities";
import { getCityWeather } from "@/lib/weather";
import { getDutyPharmacies } from "@/lib/pharmacy";
import { RankedNewsHoverList } from "@/components/news/RankedNewsHoverList";
import { getLeagueTable } from "@/lib/league-table";
import { getDailyNewspapers } from "@/lib/newspapers";
import { DailyNewspapers } from "@/components/home/DailyNewspapers";
import { getFeaturedCompanies } from "@/lib/companies";
import { FeaturedCompanies } from "@/components/home/FeaturedCompanies";
import { getOfficialAdsBundle } from "@/lib/official-ads";

const EMPTY_ARTICLES: Awaited<ReturnType<typeof getLatestArticles>> = [];

export const revalidate = 60;

export default async function HomePage() {
  const settings = await getSettings();
  const session = await auth();

  const needRates = settings.showParity !== "0" || settings.showRates !== "0";
  const needPrayer = settings.showImsakiye !== "0";
  const needHoroscope = settings.showHoroscope !== "0";
  const needBroadcast = settings.showBroadcast !== "0";
  const needLiveScore = settings.showLiveScore !== "0";
  const needCards = settings.showCategoryCards !== "0";
  const needSpotlight = settings.showCategorySpotlight !== "0";
  const needPoll = settings.showPoll !== "0";
  const needForYou = settings.showForYou !== "0" && Boolean(session?.user);
  const needSurmanset = settings.showSurmanset !== "0";
  const needNewspapers = settings.showDailyNewspapers !== "0";
  const needCompanies = settings.showFeaturedCompanies !== "0";
  const needOfficialAds = settings.showOfficialAds !== "0";
  const instagramProfile = settings.instagramUrl?.trim();
  const citySlug = (await cookies()).get(CITY_COOKIE)?.value;
  const prayerCity = resolveCity(citySlug);

  const [
    featured,
    surmanset,
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
    quotedAuthors,
    breaking,
    rates,
    prayers,
    horoscopes,
    broadcastItems,
    liveScores,
    featuredRailAd,
    instagramPost,
    homepagePoll,
    forYouArticles,
    weather,
    pharmacies,
    leagueTable,
    newspapers,
    companies,
    officialAds,
  ] = await Promise.all([
    safeLoad("featured", () => getFeaturedArticles(12), EMPTY_ARTICLES),
    needSurmanset
      ? safeLoad("surmanset", () => getSurmansetArticles(10), EMPTY_ARTICLES)
      : Promise.resolve(EMPTY_ARTICLES),
    safeLoad("latest", () => getLatestArticles(24), EMPTY_ARTICLES),
    settings.showMostRead !== "0"
      ? safeLoad("mostRead", () => getMostReadArticles(6), EMPTY_ARTICLES)
      : Promise.resolve(EMPTY_ARTICLES),
    settings.showTrendingWeek !== "0"
      ? safeLoad("trendingWeek", () => getTrendingArticles(6), EMPTY_ARTICLES)
      : Promise.resolve(EMPTY_ARTICLES),
    settings.showMostCommented !== "0"
      ? safeLoad("mostCommented", () => getMostCommentedArticles(6), EMPTY_ARTICLES)
      : Promise.resolve(EMPTY_ARTICLES),
    settings.showMostBookmarked !== "0"
      ? safeLoad("mostBookmarked", () => getMostBookmarkedArticles(6), EMPTY_ARTICLES)
      : Promise.resolve(EMPTY_ARTICLES),
    settings.showVideos !== "0"
      ? safeLoad("videos", () => getVideoArticles(6), EMPTY_ARTICLES)
      : Promise.resolve(EMPTY_ARTICLES),
    safeLoad("categories", () => getCategoriesWithChildren(), []),
    safeLoad("gundem", () => getArticlesByCategory("gundem", 5), EMPTY_ARTICLES),
    settings.showInterviews !== "0"
      ? safeLoad("interviews", () => getArticlesByCategory("roportaj", 4), EMPTY_ARTICLES)
      : Promise.resolve(EMPTY_ARTICLES),
    settings.showPhotoGallery !== "0"
      ? safeLoad("galleries", () => getGalleries(3), [])
      : Promise.resolve([]),
    settings.showEditorNews !== "0"
      ? safeLoad("editors", () => getAuthorsWithLatestArticle(8), [])
      : Promise.resolve([]),
    settings.showEditorNews !== "0"
      ? safeLoad("quotedAuthors", () => getQuotedAuthorArticles(8), EMPTY_ARTICLES)
      : Promise.resolve(EMPTY_ARTICLES),
    settings.showTopHeadlines !== "0" || settings.showFeatured !== "0"
      ? safeLoad("breaking", () => getBreakingArticles(5), EMPTY_ARTICLES)
      : Promise.resolve(EMPTY_ARTICLES),
    needRates ? safeLoad("rates", () => getRates(), null) : Promise.resolve(null),
    needPrayer ? safeLoad("prayers", () => getPrayerTimes(prayerCity), null) : Promise.resolve(null),
    needHoroscope ? safeLoad("horoscopes", () => getDailyHoroscopes(), []) : Promise.resolve([]),
    needBroadcast
      ? safeLoad("broadcast", () => getBroadcastItems({ limit: 12 }), [])
      : Promise.resolve([]),
    needLiveScore ? safeLoad("liveScores", () => getLiveScores(), null) : Promise.resolve(null),
    safeLoad("featuredRailAd", () => getActiveAd("069"), null),
    instagramProfile
      ? safeLoad("instagram", () => getLatestInstagramPost(instagramProfile), null)
      : Promise.resolve(null),
    needPoll ? safeLoad("homepagePoll", () => getActiveHomepagePoll(), null) : Promise.resolve(null),
    needForYou && session?.user
      ? safeLoad("forYou", () => getPersonalizedArticles(session.user.id, 6), EMPTY_ARTICLES)
      : Promise.resolve(EMPTY_ARTICLES),
    safeLoad("weather", () => getCityWeather(prayerCity), null),
    safeLoad("pharmacies", () => getDutyPharmacies("Düzce"), []),
    safeLoad("leagueTable", () => getLeagueTable("tur.1"), null),
    needNewspapers
      ? safeLoad("newspapers", () => getDailyNewspapers(), [])
      : Promise.resolve([]),
    needCompanies
      ? safeLoad("companies", () => getFeaturedCompanies(12), [])
      : Promise.resolve([]),
    needOfficialAds
      ? safeLoad(
          "officialAds",
          () => getOfficialAdsBundle(24),
          { byType: { icra: [], ihale: [], tebligat: [], personel: [] }, totals: { icra: 0, ihale: 0, tebligat: 0, personel: 0 } },
        )
      : Promise.resolve({
          byType: { icra: [], ihale: [], tebligat: [], personel: [] },
          totals: { icra: 0, ihale: 0, tebligat: 0, personel: 0 },
        }),
  ]);

  const homepagePollState = homepagePoll?.id
    ? await safeLoad("homepagePollState", () => getPollStateForServer(homepagePoll.id), null)
    : null;

  const interviews =
    interviewsRaw.length > 0
      ? interviewsRaw
      : await safeLoad(
          "interviewsFallback",
          async () => {
            const rows = await getArticlesByCategory("kultur-sanat", 4);
            return rows.length > 0 ? rows : latest.slice(0, 4);
          },
          latest.slice(0, 4),
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
  const authorLatestIds = new Set(editors.map((row) => row.article.id));
  const quotedUnique = quotedAuthors
    .filter((a) => !authorLatestIds.has(a.id))
    .slice(0, 5);
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
      articles: await safeLoad(
        `category:${c.slug}`,
        () =>
          getArticlesByCategory(c.slug, 5, 0, {
            childSlugs: childSlugsFor(c.slug, c.children),
          }),
        EMPTY_ARTICLES,
      ),
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

      {/* 1) Manşet omurgası — tam genişlik */}
      {needSurmanset && surmanset.length > 0 ? <SurmansetBanner articles={surmanset} /> : null}
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

      {/* 2) Kompakt şeritler — tam genişlik */}
      <div className="mt-4 space-y-3">
        {settings.showParity !== "0" && parityItems.length > 0 ? (
          <ParityStrip items={parityItems} design={parseParityDesign(settings.parityDesign)} />
        ) : null}
        {settings.showLiveScore !== "0" && liveScores && liveScores.matches.length > 0 ? (
          <LiveScoreStrip data={liveScores} />
        ) : null}
        {settings.showBroadcast !== "0" && broadcastItems.length > 0 ? (
          <BroadcastStrip items={broadcastItems} />
        ) : null}
      </div>

      {settings.showForYou !== "0" && forYouArticles.length > 0 ? (
        <ForYouSection articles={forYouArticles} />
      ) : null}

      {/* 3) Haber akışı + yan sütun */}
      <div className="mt-6 grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        <div className="flex min-w-0 flex-col gap-8">
          {settings.showDayHeadlines !== "0" ? <DayHeadlinesSection articles={dayHeadlines} /> : null}
          {settings.showCategoryCards !== "0" && categoryLead.length > 0 ? (
            <CategoryNewsBlocks blocks={categoryLead} />
          ) : null}
          {settings.showGundemBand !== "0" && !gundemInCards ? (
            <CategoryBandSection title="Gündem" href={categoryHref("gundem")} articles={gundemUnique} />
          ) : null}

          <AdUnit code="151" />

          {settings.showInterviews !== "0" ? (
            <InterviewSection
              articles={interviewsUnique}
              href={interviewsRaw.length > 0 ? categoryHref("roportaj") : categoryHref("kultur-sanat")}
            />
          ) : null}
          {settings.showPhotoGallery !== "0" ? <PhotoGallerySection items={galleryItems} /> : null}

          {settings.showEditorNews !== "0" ? (
            <EditorNewsSection authors={editors} quotedArticles={quotedUnique} />
          ) : null}

          {settings.showCategoryCards !== "0" && categoryRest.length > 0 ? (
            <CategoryNewsBlocks blocks={categoryRest} />
          ) : null}

          {settings.showImsakiye !== "0" && prayers ? (
            <ImsakiyeBar day={prayers} design={parseImsakiyeDesign(settings.imsakiyeDesign)} />
          ) : null}
          {settings.showHoroscope !== "0" && horoscopes.length > 0 ? (
            <HoroscopeStrip items={horoscopes} />
          ) : null}

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

          {needNewspapers && newspapers.length > 0 ? (
            <DailyNewspapers items={newspapers} />
          ) : null}

          {needCompanies && companies.length > 0 ? (
            <FeaturedCompanies items={companies} />
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
          {!featuredRailAd ? <AdUnit code="069" className="py-0" /> : null}
          {weather ? <SidebarWeather weather={weather} /> : null}
          {instagramPost ? <InstagramLatestCard post={instagramPost} /> : null}
          {settings.showPoll !== "0" && homepagePollState?.id ? (
            <PollWidget pollId={homepagePollState.id} initial={homepagePollState} compact />
          ) : null}
          <AdUnit code="300" className="py-0" />
          {prayers ? <SidebarPrayerTimes day={prayers} /> : null}
          {settings.showMostRead !== "0" ? (
            <div className="border border-border bg-white p-4">
              <SectionHeading title="Çok Okunanlar" href="/enler#cok-okunanlar" className="mb-2" />
              <RankedNewsHoverList articles={mostRead} />
            </div>
          ) : null}
          <SidebarPharmacy initialPharmacies={pharmacies ?? []} />
          {needOfficialAds ? <SidebarOfficialAds data={officialAds} /> : null}
          {settings.showTrendingWeek !== "0" && trendingWeek.length > 0 ? (
            <div className="border border-border bg-white p-4">
              <SectionHeading title="Haftanın Trendi" href="/enler#haftanin-trendi" className="mb-2" />
              <RankedNewsHoverList articles={trendingWeek} />
            </div>
          ) : null}
          {settings.showMostCommented !== "0" && mostCommented.length > 0 ? (
            <div className="border border-border bg-white p-4">
              <SectionHeading
                title="En Çok Yorumlanan"
                href="/enler#en-cok-yorumlanan"
                className="mb-2"
              />
              <RankedNewsHoverList articles={mostCommented} />
            </div>
          ) : null}
          {settings.showMostBookmarked !== "0" && mostBookmarked.length > 0 ? (
            <div className="border border-border bg-white p-4">
              <SectionHeading
                title="En Çok Kaydedilen"
                href="/enler#en-cok-kaydedilen"
                className="mb-2"
              />
              <RankedNewsHoverList articles={mostBookmarked} />
            </div>
          ) : null}
          {leagueTable ? <SidebarLeagueTable initial={leagueTable} /> : null}
        </aside>
      </div>
    </Container>
  );
}
