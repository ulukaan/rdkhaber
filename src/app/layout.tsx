import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { darkenColor } from "@/lib/utils";
import { getSiteUrl } from "@/lib/site-url";
import { GoogleAdSense } from "@/components/ads/GoogleAdSense";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Hostinger build workers cannot rely on MySQL; render on request instead.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const description = settings.metaDescription || settings.siteSlogan;
  const keywords = settings.metaKeywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    icons: settings.faviconUrl
      ? {
          icon: [
            { url: settings.faviconUrl, sizes: "32x32", type: "image/png" },
            { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
          ],
          apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
        }
      : undefined,
    verification: settings.googleSiteVerification
      ? { google: settings.googleSiteVerification }
      : undefined,
    openGraph: {
      siteName: settings.siteName,
      title: settings.siteName,
      description,
      type: "website",
      locale: "tr_TR",
      images: settings.logoUrl ? [settings.logoUrl] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.siteName,
      description,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  const gaId = settings.googleAnalyticsId.trim();
  const gtmId = settings.googleTagManagerId.trim();
  const adsenseClient = settings.googleAdsenseClient.trim();
  const adsenseAuto = settings.googleAdsenseAutoAds === "1";

  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={
        {
          "--brand": settings.brandColor,
          "--brand-dark": darkenColor(settings.brandColor),
        } as React.CSSProperties
      }
    >
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
      <body className="min-h-full flex flex-col">
        {settings.customHeadHtml ? (
          <div hidden dangerouslySetInnerHTML={{ __html: settings.customHeadHtml }} />
        ) : null}
        {children}
        {settings.customBodyEndHtml ? (
          <div dangerouslySetInnerHTML={{ __html: settings.customBodyEndHtml }} />
        ) : null}
        <GoogleAdSense client={adsenseClient} autoAds={adsenseAuto} />
      </body>
      {!gtmId && gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
