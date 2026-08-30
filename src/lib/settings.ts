import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { ensureLegalPages } from "@/lib/legal-pages";

export const DEFAULT_SETTINGS = {
  siteName: "Düzce Radikal",
  siteSlogan: "Türkiye ve dünyadan son dakika haberleri",
  logoUrl: "/brand/logo.png",
  faviconUrl: "/brand/favicon.png",
  brandColor: "#d0021b",
  whatsappNumber: "905000000000",
  tipLinePhone: "0850 000 00 00",
  tipLineEmail: "info@duzceradikal.com",
  contactEmail: "info@duzceradikal.com",
  contactPhone: "",
  contactAddress: "",
  footerAbout:
    "Türkiye'den ve Dünya’dan son dakika haberler, köşe yazıları, magazinden siyasete, spordan seyahate bütün konuların tek adresi Düzce Radikal platformunda; duzceradikal.com haber içerikleri kaynak gösterilmeden alıntı yapılamaz, kanuna aykırı ve izinsiz olarak kopyalanamaz, başka yerde yayınlanamaz. Aykırı işlem yapan kişi/kişiler için yasal başvuru hakkı saklı tutulmaktadır. Düzce Radikal'i tercih ettiğiniz için teşekkür ederiz.",
  copyrightText: "",
  metaDescription: "",
  metaKeywords: "",
  facebookUrl: "",
  twitterUrl: "",
  instagramUrl: "https://www.instagram.com/duzceradikal",
  youtubeUrl: "",
  showRates: "1",
  showTicker: "1",
  showTopHeadlines: "1",
  showFeatured: "1",
  showLatestFeed: "1",
  showCategorySpotlight: "1",
  categorySpotlightSlugs: "",
  showVideos: "1",
  showMostRead: "1",
  showDayHeadlines: "1",
  showGundemBand: "1",
  showInterviews: "1",
  showPhotoGallery: "1",
  showEditorNews: "1",
  showCategoryCards: "1",
  categoryCardSlugs: "",
  showParity: "1",
  showImsakiye: "1",
  showBroadcast: "1",
  showHoroscope: "1",
  showLiveScore: "1",
  parityDesign: "2",
  imsakiyeDesign: "2",
  tvChannelSlugs: "",
  tvPageTitle: "Yayın Akışı",
  tvPageIntro: "Ulusal kanalların güncel program listesi.",
  tvGuideDesign: "1",
  customHeadHtml: "",
  customBodyEndHtml: "",
  googleAnalyticsId: "",
  googleTagManagerId: "",
  googleSiteVerification: "",
  googleAdsenseClient: "",
  googleAdsenseAutoAds: "0",
  newsletterFromName: "",
  newsletterFromEmail: "info@duzceradikal.com",
  newsletterSmtpHost: "",
  newsletterSmtpPort: "587",
  newsletterSmtpUser: "",
  newsletterSmtpPass: "",
  newsletterSmtpSecure: "0",
} as const;

export type SettingKey = keyof typeof DEFAULT_SETTINGS;

export type ParityDesign = "1" | "2" | "3";
export type ImsakiyeDesign = "1" | "2";
export type TvGuideDesign = "1" | "2";

export function parseParityDesign(raw: string): ParityDesign {
  return raw === "1" || raw === "3" ? raw : "2";
}

export function parseImsakiyeDesign(raw: string): ImsakiyeDesign {
  return raw === "1" ? "1" : "2";
}

export function parseTvGuideDesign(raw: string): TvGuideDesign {
  return raw === "2" ? "2" : "1";
}

export type CategoryBlockLayout = "3" | "4" | "5";

export type CategoryBlockConfig = {
  slug: string;
  layout: CategoryBlockLayout;
};

export function parseSlugList(raw: string) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function serializeSlugList(slugs: string[]) {
  return slugs.map((s) => s.trim()).filter(Boolean).join(",");
}

export function parseCategoryBlocks(raw: string): CategoryBlockConfig[] {
  const blocks: CategoryBlockConfig[] = [];
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const [slug, layoutRaw] = trimmed.split(":");
    if (!slug) continue;
    const layout: CategoryBlockLayout =
      layoutRaw === "4" || layoutRaw === "5" ? layoutRaw : "3";
    blocks.push({ slug, layout });
  }
  return blocks;
}

export function serializeCategoryBlocks(blocks: CategoryBlockConfig[]) {
  return blocks.map((b) => `${b.slug}:${b.layout}`).join(",");
}

const SITE_EMAIL = "info@duzceradikal.com";

function isLegacySiteEmail(email: string) {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return true;
  return trimmed.endsWith("@rdhaber.com");
}

export const getSettings = cache(async (): Promise<Record<SettingKey, string>> => {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const settings = { ...DEFAULT_SETTINGS, ...map } as Record<SettingKey, string>;

  try {
    if (settings.siteName.trim() === "RD Haber") {
      await setSetting("siteName", DEFAULT_SETTINGS.siteName);
      settings.siteName = DEFAULT_SETTINGS.siteName;
    }
    if (!settings.footerAbout.trim()) {
      await setSetting("footerAbout", DEFAULT_SETTINGS.footerAbout);
      settings.footerAbout = DEFAULT_SETTINGS.footerAbout;
    }
    settings.logoUrl = coerceBrandAsset(settings.logoUrl, DEFAULT_SETTINGS.logoUrl);
    settings.faviconUrl = coerceBrandAsset(
      settings.faviconUrl,
      DEFAULT_SETTINGS.faviconUrl,
    );
    if (
      !settings.instagramUrl.trim() ||
      /instagram\.com\/rdkhaber\/?$/i.test(settings.instagramUrl.trim())
    ) {
      await setSetting("instagramUrl", DEFAULT_SETTINGS.instagramUrl);
      settings.instagramUrl = DEFAULT_SETTINGS.instagramUrl;
    }
    if (isLegacySiteEmail(settings.contactEmail)) {
      await setSetting("contactEmail", SITE_EMAIL);
      settings.contactEmail = SITE_EMAIL;
    }
    if (isLegacySiteEmail(settings.tipLineEmail)) {
      await setSetting("tipLineEmail", SITE_EMAIL);
      settings.tipLineEmail = SITE_EMAIL;
    }
    if (!settings.newsletterFromEmail.trim() || isLegacySiteEmail(settings.newsletterFromEmail)) {
      await setSetting("newsletterFromEmail", SITE_EMAIL);
      settings.newsletterFromEmail = SITE_EMAIL;
    }
    await ensureLegalPages(settings.siteName);
  } catch {
    // İlk kurulumda tablo yoksa sayfayı yine de aç.
  }

  return settings;
});

export async function setSetting(key: SettingKey, value: string) {
  return prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function setSettings(values: Partial<Record<SettingKey, string>>) {
  await Promise.all(
    Object.entries(values).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: value ?? "" },
        create: { key, value: value ?? "" },
      }),
    ),
  );
}

/** Hostinger'da /uploads deploy sonrası silinebiliyor; logo/favicon için /brand yedeği. */
function coerceBrandAsset(url: string, fallback: string) {
  const trimmed = url.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith("/uploads/")) return fallback;
  return trimmed;
}
