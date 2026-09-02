import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { darkenColor } from "@/lib/utils";
import { getSiteUrl } from "@/lib/site-url";
import { CookieConsent } from "@/components/consent/CookieConsent";
import { ConsentModeDefaultScript } from "@/components/consent/ConsentModeDefaultScript";
import { ConsentModeSync } from "@/components/consent/ConsentModeSync";
import { GoogleAdSense } from "@/components/ads/GoogleAdSense";
import { hasActiveAdsenseSlotAds } from "@/lib/ads";
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import {
  parseCustomLinkTags,
  parseCustomMetaTags,
  sanitizeCustomBodyEndHtml,
} from "@/lib/custom-code";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Hostinger build workers cannot rely on MySQL; public pages use ISR + data cache.

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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  const gaId = settings.googleAnalyticsId.trim();
  const gtmId = settings.googleTagManagerId.trim();
  const adsenseClient = settings.googleAdsenseClient.trim();
  const adsenseAuto = settings.googleAdsenseAutoAds === "1";
  const hasManualAdsense = await hasActiveAdsenseSlotAds();
  const adsenseEnabled = Boolean(adsenseClient && (adsenseAuto || hasManualAdsense));
  const googleTagsEnabled = Boolean(gtmId || gaId || adsenseEnabled);
  const customMeta = parseCustomMetaTags(settings.customHeadHtml);
  const customLinks = parseCustomLinkTags(settings.customHeadHtml);
  const customBodyEndHtml = sanitizeCustomBodyEndHtml(settings.customBodyEndHtml);

  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={
        {
          "--brand": settings.brandColor,
          "--brand-dark": darkenColor(settings.brandColor),
        } as React.CSSProperties
      }
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var p=location.pathname;if(p.indexOf('/admin')===0||p.indexOf('/editor')===0)return;var t=localStorage.getItem('rdk_theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();",
          }}
        />
        {customMeta.map((tag, index) => {
          const props: Record<string, string> = {};
          if (tag.name) props.name = tag.name;
          if (tag.property) props.property = tag.property;
          if (tag.content) props.content = tag.content;
          if (tag.httpEquiv) props.httpEquiv = tag.httpEquiv;
          if (tag.charSet) props.charSet = tag.charSet;
          return <meta key={`custom-meta-${index}`} {...props} />;
        })}
        {customLinks.map((link, index) => (
          <link
            key={`custom-link-${index}`}
            rel={link.rel}
            href={link.href}
            type={link.type}
          />
        ))}
        <link rel="alternate" type="application/rss+xml" title={`${settings.siteName} RSS`} href="/feed.xml" />
        {googleTagsEnabled ? <ConsentModeDefaultScript /> : null}
        {adsenseClient && adsenseAuto ? (
          <GoogleAdSense client={adsenseClient} enabled={adsenseEnabled} />
        ) : null}
      </head>
      <body className="min-h-full flex flex-col">
        {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
        {!gtmId && gaId ? <GoogleAnalytics gaId={gaId} /> : null}
        <ThemeProvider>
          {children}
          <ServiceWorkerRegister />
          <ConsentModeSync />
          <CookieConsent
            analyticsConfigured={Boolean(gaId || gtmId || customBodyEndHtml)}
            adsConfigured={adsenseEnabled}
            gaId={gaId}
            gtmId={gtmId}
            adsenseClient={adsenseClient}
            adsenseAuto={adsenseAuto}
            customBodyEndHtml={customBodyEndHtml}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
