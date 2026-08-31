import { Header } from "@/components/layout/Header";
import { HeaderAdBanner } from "@/components/layout/HeaderAdBanner";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloatButton } from "@/components/layout/WhatsAppFloatButton";
import { getSettings } from "@/lib/settings";
import { AdTowers } from "@/components/ads/AdTowers";
import { StickyFooterAd } from "@/components/ads/StickyFooterAd";
import { OpeningAd } from "@/components/ads/OpeningAd";
import { getActiveAd } from "@/lib/ads";

export const revalidate = 60;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  /** AdSense onay sürecinde popup/sticky ev reklamları Auto Ads ile çakışmasın. */
  const suppressHouseAds = settings.googleAdsenseAutoAds === "1";
  const stickyAd = suppressHouseAds ? null : await getActiveAd("153");

  return (
    <div className={stickyAd ? "site-sticky-ad flex min-h-svh flex-col" : "flex min-h-svh flex-col"}>
      <HeaderAdBanner />
      <Header />
      <AdTowers />
      <main className="flex-1">{children}</main>
      <Footer />
      {!suppressHouseAds ? <StickyFooterAd /> : null}
      {!suppressHouseAds ? <OpeningAd /> : null}
      <WhatsAppFloatButton whatsappNumber={settings.whatsappNumber} />
    </div>
  );
}
