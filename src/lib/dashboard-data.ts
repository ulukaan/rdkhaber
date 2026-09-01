import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60_000);
}

export type DashboardGoogleStatus = {
  analyticsId: string;
  gtmId: string;
  siteVerification: string;
  adsenseClient: string;
  adsenseAuto: boolean;
  analyticsActive: boolean;
  gtmActive: boolean;
  searchConsoleActive: boolean;
  adsenseActive: boolean;
};

export type DashboardData = {
  published: number;
  draft: number;
  review: number;
  pendingTips: number;
  pendingSubmissions: number;
  pendingComments: number;
  pendingTotal: number;
  totalViews: number;
  publishedToday: number;
  published7d: number;
  published30d: number;
  breakingCount: number;
  commentCount: number;
  userCount: number | null;
  categoryCount: number | null;
  subscriberCount: number | null;
  mediaCount: number | null;
  mediaSizeMb: number | null;
  galleryCount: number | null;
  activeAdCount: number | null;
  haberBotSourceCount: number | null;
  topArticles: { title: string; slug: string; viewCount: number; publishedAt: Date | null }[];
  recent: {
    id: string;
    title: string;
    status: string;
    createdAt: Date;
    author: { name: string };
  }[];
  google: DashboardGoogleStatus | null;
};

export async function loadDashboardData(role: Role): Promise<DashboardData> {
  const isAdmin = role === "ADMIN";
  const sinceToday = new Date();
  sinceToday.setHours(0, 0, 0, 0);

  const [
    published,
    draft,
    review,
    pendingTips,
    pendingSubmissions,
    pendingComments,
    totalViewsAgg,
    publishedToday,
    published7d,
    published30d,
    breakingCount,
    commentCount,
    topArticles,
    recent,
    userCount,
    categoryCount,
    subscriberCount,
    mediaAgg,
    galleryCount,
    activeAdCount,
    haberBotSourceCount,
    settings,
  ] = await Promise.all([
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: "REVIEW" } }),
    prisma.tip.count({ where: { status: "PENDING" } }),
    prisma.newsSubmission.count({ where: { status: "PENDING" } }),
    prisma.comment.count({ where: { approved: false } }),
    prisma.article.aggregate({ _sum: { viewCount: true } }),
    prisma.article.count({
      where: { status: "PUBLISHED", publishedAt: { gte: sinceToday } },
    }),
    prisma.article.count({
      where: { status: "PUBLISHED", publishedAt: { gte: daysAgo(7) } },
    }),
    prisma.article.count({
      where: { status: "PUBLISHED", publishedAt: { gte: daysAgo(30) } },
    }),
    prisma.article.count({ where: { isBreaking: true, status: "PUBLISHED" } }),
    prisma.comment.count({ where: { approved: true } }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { viewCount: "desc" },
      take: 5,
      select: { title: true, slug: true, viewCount: true, publishedAt: true },
    }),
    prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        author: { select: { name: true } },
      },
    }),
    isAdmin ? prisma.user.count() : Promise.resolve(null),
    isAdmin ? prisma.category.count() : Promise.resolve(null),
    isAdmin
      ? prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } })
      : Promise.resolve(null),
    isAdmin
      ? prisma.media.aggregate({ _count: true, _sum: { size: true } })
      : Promise.resolve(null),
    isAdmin ? prisma.gallery.count() : Promise.resolve(null),
    isAdmin ? prisma.adSlot.count({ where: { active: true } }) : Promise.resolve(null),
    isAdmin ? prisma.haberBotSource.count({ where: { enabled: true } }) : Promise.resolve(null),
    isAdmin ? getSettings() : Promise.resolve(null),
  ]);

  const analyticsId = settings?.googleAnalyticsId.trim() ?? "";
  const gtmId = settings?.googleTagManagerId.trim() ?? "";
  const siteVerification = settings?.googleSiteVerification.trim() ?? "";
  const adsenseClient = settings?.googleAdsenseClient.trim() ?? "";
  const adsenseAuto = settings?.googleAdsenseAutoAds === "1";

  return {
    published,
    draft,
    review,
    pendingTips,
    pendingSubmissions,
    pendingComments,
    pendingTotal: pendingTips + pendingSubmissions + pendingComments + review,
    totalViews: totalViewsAgg._sum.viewCount ?? 0,
    publishedToday,
    published7d,
    published30d,
    breakingCount,
    commentCount,
    userCount,
    categoryCount,
    subscriberCount,
    mediaCount: mediaAgg?._count ?? null,
    mediaSizeMb: mediaAgg?._sum.size ? mediaAgg._sum.size / (1024 * 1024) : null,
    galleryCount,
    activeAdCount,
    haberBotSourceCount,
    topArticles,
    recent,
    google: isAdmin
      ? {
          analyticsId,
          gtmId,
          siteVerification,
          adsenseClient,
          adsenseAuto,
          analyticsActive: Boolean(analyticsId),
          gtmActive: Boolean(gtmId),
          searchConsoleActive: Boolean(siteVerification),
          adsenseActive: Boolean(adsenseClient),
        }
      : null,
  };
}
