export type ArticleSummary = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImageUrl: string | null;
  videoUrl?: string | null;
  isBreaking: boolean;
  viewCount: number;
  publishedAt: Date | string | null;
  category: {
    name: string;
    slug: string;
    color: string | null;
  };
  headlineKicker?: string | null;
  headlineTitle?: string | null;
  headlineSub?: string | null;
  headlineAlign?: string | null;
  headlineImageAlign?: string | null;
  imageFiveHeadline?: string | null;
  imageMainHeadline?: string | null;
  author?: {
    id?: string;
    name: string;
    slug?: string | null;
    avatarUrl?: string | null;
    role?: string;
  };
  reporterName?: string | null;
};
