import { getSiteUrl } from "@/lib/site-url";

type ArticleJsonLdInput = {
  title: string;
  summary: string;
  slug: string;
  coverImageUrl?: string | null;
  publishedAt?: Date | null;
  updatedAt: Date;
  authorName: string;
  siteName: string;
  keywords?: string[];
};

export function buildNewsArticleJsonLd(input: ArticleJsonLdInput) {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/haber/${input.slug}`;
  const image = input.coverImageUrl
    ? input.coverImageUrl.startsWith("http")
      ? input.coverImageUrl
      : `${siteUrl}${input.coverImageUrl}`
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: input.title,
    description: input.summary,
    url,
    mainEntityOfPage: url,
    isAccessibleForFree: true,
    inLanguage: "tr-TR",
    datePublished: input.publishedAt?.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    author: { "@type": "Person", name: input.authorName },
    publisher: {
      "@type": "Organization",
      name: input.siteName,
      url: siteUrl,
    },
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
  const logo = input.logoUrl
    ? input.logoUrl.startsWith("http")
      ? input.logoUrl
      : `${siteUrl}${input.logoUrl}`
    : undefined;

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
