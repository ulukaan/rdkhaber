import type { CSSProperties } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { NewsCard } from "@/components/news/NewsCard";
import { VideoCard } from "@/components/news/VideoCard";
import { CoverImage } from "@/components/news/CoverImage";
import { AnaManset10 } from "@/components/news/AnaManset10";
import { AdUnit } from "@/components/ads/AdUnit";
import { formatRelativeTime } from "@/lib/utils";
import {
  categoryHref,
  resolveCategoryPageTemplate,
  splitAnaMansetHeadlines,
  type CategoryArchiveMode,
  type CategoryPageTemplate,
} from "@/lib/category-path";
import type { ArticleSummary } from "@/types/article";
import type { MarketGroup, MarketItem } from "@/lib/rates";
import type { ParityDesign } from "@/lib/settings";
import { partyLogoUrl } from "@/lib/party-logos";
import { ParityStrip } from "@/components/home/ParityStrip";
import { EconomyCategoryAside } from "@/components/news/EconomyCategoryAside";

export type CategoryArchiveData = {
  name: string;
  slug?: string;
  headingH1: string | null;
  description: string | null;
  color: string | null;
  headerTextColor: string | null;
  headerHoverColor: string | null;
  hoverColor: string | null;
  photoGallery: boolean;
  videoGallery: boolean;
  fixedDesign: boolean;
  fixedTemplate: string | null;
  boxCount: number;
  children: Array<{ name: string; slug: string }>;
  parent?: { name: string; slug: string } | null;
};

function isPoliticalPartyCategory(category: CategoryArchiveData) {
  const parent = category.parent?.slug;
  if (parent === "siyaset" || parent === "siyasi-partiler") return true;
  return /parti/i.test(category.slug ?? "") || /\bparti\b/i.test(category.name);
}

function CategoryHeroHeader({
  category,
  title,
  headerBg,
  headerText,
  headerHover,
}: {
  category: CategoryArchiveData;
  title: string;
  headerBg: string;
  headerText: string;
  headerHover: string;
}) {
  const party = isPoliticalPartyCategory(category);
  const logo = category.slug ? partyLogoUrl(category.slug) : null;

  return (
    <div
      className="relative overflow-hidden border-b border-black/15"
      style={{ backgroundColor: headerBg }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-32deg, transparent, transparent 14px, rgba(255,255,255,0.4) 14px, rgba(255,255,255,0.4) 15px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(125deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.12) 42%, rgba(255,255,255,0.14) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full blur-2xl"
        style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
      />

      <Container className="relative py-5 md:py-6">
        <div className="flex items-center gap-4 md:gap-6">
          {logo ? (
            <div className="relative shrink-0 rounded border border-black/10 bg-white p-0.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo}
                alt={`${title} logosu`}
                width={56}
                height={56}
                className="h-10 w-10 object-contain md:h-14 md:w-14"
              />
            </div>
          ) : (
            <span
              className="w-1.5 shrink-0 self-stretch rounded-full md:w-2"
              style={{ backgroundColor: headerText, boxShadow: `0 0 18px ${headerText}55` }}
              aria-hidden
            />
          )}
          <div className="min-w-0 flex-1">
            <h1
              className={
                party
                  ? "text-3xl font-black tracking-tight drop-shadow-sm md:text-5xl md:leading-[1.05]"
                  : "text-2xl font-black tracking-tight md:text-4xl md:leading-tight"
              }
              style={{ color: headerText }}
            >
              {title}
            </h1>
            {category.description ? (
              <p
                className="mt-3 max-w-2xl text-sm leading-relaxed opacity-90 md:text-[15px]"
                style={{ color: headerText }}
              >
                {category.description}
              </p>
            ) : null}
            {category.children.length > 0 ? (
              <nav className="mt-5 flex flex-wrap gap-2" aria-label="Alt kategoriler">
                {category.children.map((child) => (
                  <Link
                    key={child.slug}
                    href={categoryHref(child.slug)}
                    className="rounded-md border border-white/30 bg-black/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide backdrop-blur-sm transition-colors hover:bg-white/20"
                    style={{ color: headerHover }}
                  >
                    {child.name}
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>
        </div>
      </Container>

      <div
        className="relative h-1.5"
        style={{
          background: `linear-gradient(90deg, ${headerText} 0%, transparent 55%, rgba(0,0,0,0.25) 100%)`,
          opacity: 0.55,
        }}
      />
    </div>
  );
}


export function CategoryArchive({
  category,
  headlines,
  mansetSide,
  articles,
  currentPage,
  mode = "template",
  financeRail,
}: {
  category: CategoryArchiveData;
  headlines: ArticleSummary[];
  /** Verilirse Ana Manşet sağ ızgarası (Öne Çıkan); yoksa headlines bölünür. */
  mansetSide?: ArticleSummary[];
  articles: ArticleSummary[];
  currentPage: number;
  mode?: CategoryArchiveMode;
  financeRail?: {
    parityItems: MarketItem[];
    marketGroups?: MarketGroup[];
    mostRead: ArticleSummary[];
    parityDesign?: ParityDesign;
  };
}) {
  const pageSize = category.boxCount || 18;
  const headerBg = category.color || "#d0021b";
  const headerText = category.headerTextColor || "#ffffff";
  const headerHover = category.headerHoverColor || "#ffffff";
  const hover = category.hoverColor || headerBg;
  const title = category.headingH1?.trim() || category.name;
  const template = resolveCategoryPageTemplate(category.fixedTemplate);
  const split = splitAnaMansetHeadlines(headlines);
  const slides = mansetSide !== undefined ? headlines : split.slides;
  const side = mansetSide !== undefined ? mansetSide : split.side;
  const showManset = mode === "template" && slides.length > 0;
  const compact = Boolean(financeRail);

  const archiveMain = (
    <>
      {mode === "video" ? (
        articles.length === 0 ? (
          <EmptyState categoryName={category.name} finance={compact} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {articles.map((a) => (
              <VideoCard key={a.id} article={a} />
            ))}
          </div>
        )
      ) : mode === "photo" ? (
        articles.length === 0 ? (
          <EmptyState categoryName={category.name} finance={compact} />
        ) : (
          <PhotoGrid articles={articles} />
        )
      ) : articles.length === 0 && !showManset ? (
        <EmptyState categoryName={category.name} finance={compact} />
      ) : articles.length === 0 ? null : (
        <TemplateBody template={template} articles={articles} compact={compact} />
      )}

      <AdUnit code="150" />

      <div className="mt-6 flex justify-center gap-3">
        {currentPage > 1 && (
          <a
            href={`?page=${currentPage - 1}`}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-surface"
          >
            Önceki
          </a>
        )}
        {articles.length === pageSize && (
          <a
            href={`?page=${currentPage + 1}`}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-surface"
          >
            Sonraki
          </a>
        )}
      </div>
    </>
  );

  return (
    <div
      style={
        {
          "--cat-header": headerBg,
          "--cat-header-text": headerText,
          "--cat-header-hover": headerHover,
          "--cat-hover": hover,
        } as CSSProperties
      }
    >
      <CategoryHeroHeader
        category={category}
        title={title}
        headerBg={headerBg}
        headerText={headerText}
        headerHover={headerHover}
      />

      {compact && financeRail ? (
        <Container className="py-4">
          <div className="space-y-3">
            {financeRail.parityItems.length > 0 ? (
              <ParityStrip items={financeRail.parityItems} design="3" />
            ) : null}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
              <div className="min-w-0 space-y-4">
                {showManset ? (
                  <AnaManset10 slides={slides} side={side} accent={headerBg} compact />
                ) : null}
                {showManset ? <AdUnit code="151" /> : null}
                {archiveMain}
              </div>
              <EconomyCategoryAside
                parityItems={financeRail.parityItems}
                marketGroups={financeRail.marketGroups}
                mostRead={financeRail.mostRead}
                latest={articles.slice(0, 5)}
                categoryName={category.name}
                categorySlug={category.slug ?? "ekonomi"}
              />
            </div>
          </div>
        </Container>
      ) : (
        <>
          {showManset ? (
            <div className="border-b border-border">
              <Container className="py-3 md:py-4">
                <AnaManset10 slides={slides} side={side} accent={headerBg} />
              </Container>
            </div>
          ) : null}

          <Container className="py-6">{archiveMain}</Container>
        </>
      )}
    </div>
  );
}

function EmptyState({
  categoryName,
  finance = false,
}: {
  categoryName?: string;
  finance?: boolean;
}) {
  return (
    <div className="border border-border bg-white px-5 py-8 text-center">
      <p className="text-base font-extrabold text-ink">
        {categoryName
          ? `${categoryName} kategorisinde henüz yayınlanmış haber yok`
          : "Bu kategoride henüz haber bulunmuyor"}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
        {finance
          ? "Piyasa göstergeleri sağda ve üstte güncellenmeye devam eder. Yeni ekonomi haberleri yayınlandıkça burada listelenir."
          : "Yeni içerikler yayınlandıkça bu sayfada görünecek."}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/"
          className="border border-border bg-surface px-3 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
        >
          Anasayfa
        </Link>
        <Link
          href={categoryHref("gundem")}
          className="border border-border bg-surface px-3 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
        >
          Gündem
        </Link>
        {finance ? null : (
          <Link
            href={categoryHref("ekonomi")}
            className="border border-border bg-surface px-3 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
          >
            Ekonomi
          </Link>
        )}
      </div>
    </div>
  );
}

function TemplateBody({
  template,
  articles,
  compact = false,
}: {
  template: CategoryPageTemplate;
  articles: ArticleSummary[];
  compact?: boolean;
}) {
  if (template === "liste") {
    return (
      <div className="divide-y divide-border border border-border bg-white">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} variant="horizontal" className="px-3" />
        ))}
      </div>
    );
  }

  if (template === "dergi") {
    const [lead, ...rest] = articles;
    if (!lead) return null;
    return (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <NewsCard article={lead} variant="caption" className="min-h-[280px]" />
          <div className="grid grid-cols-2 gap-3">
            {rest.slice(0, 4).map((article) => (
              <NewsCard key={article.id} article={article} variant="poster" />
            ))}
          </div>
        </div>
        {rest.length > 4 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {rest.slice(4).map((article) => (
              <NewsCard key={article.id} article={article} variant="caption" />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  // klasik
  return (
    <div
      className={
        compact
          ? "grid grid-cols-2 gap-3 md:grid-cols-3"
          : "grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
      }
    >
      {articles.map((a) => (
        <NewsCard key={a.id} article={a} variant="poster" />
      ))}
    </div>
  );
}

function PhotoGrid({ articles }: { articles: ArticleSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <Link key={article.id} href={`/haber/${article.slug}`} className="group block">
          <CoverImage
            src={article.coverImageUrl}
            alt={article.title}
            color={article.category.color}
            className="aspect-[16/10] w-full"
            sizes="(max-width: 1024px) 50vw, 33vw"
          />
          <h2 className="mt-2 text-base font-extrabold text-ink group-hover:text-[var(--cat-hover)]">
            {article.title}
          </h2>
          {article.publishedAt ? (
            <time className="mt-1 block text-[11px] text-ink-soft">
              {formatRelativeTime(new Date(article.publishedAt))}
            </time>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
