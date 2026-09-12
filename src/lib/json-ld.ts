import { getSiteUrl } from "@/lib/site-url";

function absoluteUrl(pathOrUrl: string, siteUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  return `${siteUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

type ArticleJsonLdInput = {
  title: string;
  summary: string;
  slug: string;
  coverImageUrl?: string | null;
  publishedAt?: Date | null;
  updatedAt: Date;
  authorName: string;
  siteName: string;
  logoUrl?: string | null;
  section?: string | null;
  keywords?: string[];
};

export function buildNewsArticleJsonLd(input: ArticleJsonLdInput) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/haber/${input.slug}`;
  const image = input.coverImageUrl ? absoluteUrl(input.coverImageUrl, siteUrl) : undefined;
  const logo = absoluteUrl(input.logoUrl?.trim() || "/brand/logo.png", siteUrl);
  const published = (input.publishedAt ?? input.updatedAt).toISOString();

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: input.title,
    description: input.summary,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    isAccessibleForFree: true,
    inLanguage: "tr-TR",
    datePublished: published,
    dateModified: input.updatedAt.toISOString(),
    author: { "@type": "Person", name: input.authorName },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: input.siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: logo,
        width: 600,
        height: 60,
      },
    },
    ...(input.section ? { articleSection: input.section } : {}),
    ...(input.keywords?.length ? { keywords: input.keywords.join(", ") } : {}),
    ...(image ? { image: [image] } : {}),
  };
}

export function buildWebSiteJsonLd(input: {
  siteName: string;
  description: string;
  logoUrl?: string;
}) {
  const siteUrl = getSiteUrl();
  const logo = input.logoUrl ? absoluteUrl(input.logoUrl, siteUrl) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: input.siteName,
    url: siteUrl,
    description: input.description,
    inLanguage: "tr-TR",
    publisher: {
      "@type": "NewsMediaOrganization",
      name: input.siteName,
      url: siteUrl,
      ...(logo ? { logo: { "@type": "ImageObject", url: logo } } : {}),
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/arama?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
