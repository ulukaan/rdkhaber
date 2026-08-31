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
    datePublished: input.publishedAt?.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    author: { "@type": "Person", name: input.authorName },
    publisher: {
      "@type": "Organization",
      name: input.siteName,
      url: siteUrl,
    },
    ...(image ? { image: [image] } : {}),
  };
}
