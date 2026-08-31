"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth-guard";
import {
  replaceNavItems,
  getDefaultNav,
  toggleCategoryInHeaderNav,
  type NavLocation,
} from "@/lib/nav-menu";
import { setSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { revalidatePublicSite } from "@/lib/revalidate-site";
import {
  sanitizeCustomBodyEndHtml,
  sanitizeCustomHeadHtml,
} from "@/lib/custom-code";

const navLocationSchema = z.enum(["header", "footer", "footer_services", "footer_corporate"]);

const itemsSchema = z.object({
  location: navLocationSchema,
  items: z.array(
    z.object({
      label: z.string().min(1),
      href: z.string().min(1),
      visible: z.boolean(),
      children: z
        .array(
          z.object({
            label: z.string().min(1),
            href: z.string().min(1),
            visible: z.boolean(),
          }),
        )
        .optional(),
    }),
  ),
});

export async function saveNavMenuAction(raw: unknown) {
  await requireRole(["ADMIN"]);
  const parsed = itemsSchema.safeParse(raw);
  if (!parsed.success) return { error: "Geçersiz menü verisi" };
  try {
    await replaceNavItems(parsed.data.location, parsed.data.items);
  } catch (err) {
    console.error("[saveNavMenuAction]", err);
    return { error: "Menü kaydedilemedi. Sayfayı yenileyip tekrar deneyin." };
  }
  revalidatePath("/admin/gorunum/menu");
  revalidatePublicSite({ layout: true });
  return { success: true };
}

export async function resetNavMenuAction(location: NavLocation) {
  await requireRole(["ADMIN"]);
  try {
    const defaults = await getDefaultNav(location);
    await replaceNavItems(
      location,
      defaults.map((d) => ({
        label: d.label,
        href: d.href,
        visible: d.visible ?? true,
        children: d.children?.map((c) => ({
          label: c.label,
          href: c.href,
          visible: c.visible ?? true,
        })),
      })),
    );
  } catch (err) {
    console.error("[resetNavMenuAction]", err);
    return { error: "Varsayılan menü yüklenemedi." };
  }
  revalidatePath("/admin/gorunum/menu");
  revalidatePublicSite({ layout: true });
  return { success: true };
}

/** Kategoriler listesinden tek tık: üst menüye ekle / çıkar */
export async function toggleCategoryInHeaderNavAction(categoryId: string) {
  await requireRole(["ADMIN"]);
  if (!categoryId?.trim()) return { error: "Kategori bulunamadı." };

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      name: true,
      slug: true,
      parent: { select: { slug: true, name: true } },
    },
  });
  if (!category) return { error: "Kategori bulunamadı." };

  try {
    const result = await toggleCategoryInHeaderNav(category);
    revalidatePath("/admin/kategoriler");
    revalidatePath("/admin/gorunum/menu");
    revalidatePublicSite({ layout: true });
    return { success: true, inNav: result.inNav };
  } catch (err) {
    console.error("[toggleCategoryInHeaderNavAction]", err);
    return { error: "Üst menü güncellenemedi." };
  }
}

export async function saveHomepageModulesAction(raw: Record<string, string>) {
  await requireRole(["ADMIN"]);
  const keys = [
    "showRates",
    "showTicker",
    "showTopHeadlines",
    "showFeatured",
    "showLatestFeed",
    "showCategorySpotlight",
    "showVideos",
    "showMostRead",
    "showDayHeadlines",
    "showGundemBand",
    "showInterviews",
    "showPhotoGallery",
    "showEditorNews",
    "showCategoryCards",
    "showParity",
    "showImsakiye",
    "showBroadcast",
    "showHoroscope",
    "showLiveScore",
  ] as const;
  const values: Record<string, string> = {};
  for (const key of keys) {
    values[key] = raw[key] === "on" || raw[key] === "1" ? "1" : "0";
  }
  values.categoryCardSlugs = raw.categoryCardSlugs ?? "";
  values.categorySpotlightSlugs = raw.categorySpotlightSlugs ?? "";
  values.parityDesign =
    raw.parityDesign === "1" || raw.parityDesign === "3" ? raw.parityDesign : "2";
  values.imsakiyeDesign = raw.imsakiyeDesign === "1" ? "1" : "2";
  await setSettings(values);
  revalidatePublicSite();
  revalidatePath("/admin/gorunum/ogeler");
  return { success: true };
}

export async function saveCustomCodeAction(raw: Record<string, string>) {
  await requireRole(["ADMIN"]);
  const head = sanitizeCustomHeadHtml(raw.customHeadHtml ?? "");
  const body = sanitizeCustomBodyEndHtml(raw.customBodyEndHtml ?? "");
  await setSettings({
    customHeadHtml: head,
    customBodyEndHtml: body,
  });
  revalidatePublicSite({ layout: true });
  revalidatePath("/admin/gorunum/ozel-kod");
  return { success: true };
}

export async function saveGoogleSiteKitAction(raw: Record<string, string>) {
  await requireRole(["ADMIN"]);
  const ga = (raw.googleAnalyticsId ?? "").trim().toUpperCase();
  const gtm = (raw.googleTagManagerId ?? "").trim().toUpperCase();
  const verify = (raw.googleSiteVerification ?? "").trim();

  if (ga && !/^G-[A-Z0-9]+$/.test(ga)) {
    return { error: "Analytics kimliği G- ile başlamalı (ör. G-XXXXXXXX)." };
  }
  if (gtm && !/^GTM-[A-Z0-9]+$/.test(gtm)) {
    return { error: "Tag Manager kimliği GTM- ile başlamalı (ör. GTM-XXXXXX)." };
  }

  await setSettings({
    googleAnalyticsId: ga,
    googleTagManagerId: gtm,
    googleSiteVerification: verify,
  });
  revalidatePublicSite({ layout: true });
  revalidatePath("/admin/gorunum/google");
  return { success: true };
}

export async function saveGoogleAdsAction(raw: Record<string, string>) {
  await requireRole(["ADMIN"]);
  let client = (raw.googleAdsenseClient ?? "").trim().toLowerCase();
  if (client && !client.startsWith("ca-pub-")) {
    client = `ca-pub-${client.replace(/^pub-/i, "")}`;
  }
  const autoAds = raw.googleAdsenseAutoAds === "on" || raw.googleAdsenseAutoAds === "1" ? "1" : "0";

  if (client && !/^ca-pub-\d+$/.test(client)) {
    return { error: "AdSense yayıncı kimliği ca-pub-XXXXXXXXXX biçiminde olmalı." };
  }

  await setSettings({
    googleAdsenseClient: client,
    googleAdsenseAutoAds: autoAds,
  });
  revalidatePublicSite({ layout: true });
  revalidatePath("/ads.txt");
  revalidatePath("/admin/gorunum/google");
  return { success: true };
}

export async function saveTvGuideAction(raw: Record<string, string>) {
  await requireRole(["ADMIN"]);
  await setSettings({
    tvPageTitle: (raw.tvPageTitle ?? "").trim() || "Yayın Akışı",
    tvPageIntro: (raw.tvPageIntro ?? "").trim(),
    tvGuideDesign: raw.tvGuideDesign === "2" ? "2" : "1",
    tvChannelSlugs: raw.tvChannelSlugs ?? "",
    showBroadcast: raw.showBroadcast === "on" || raw.showBroadcast === "1" ? "1" : "0",
  });
  revalidatePublicSite();
  revalidatePath("/yayin-akisi");
  revalidatePath("/admin/yayin-akisi");
  return { success: true };
}
