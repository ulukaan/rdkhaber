import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/PageHeader";
import { GoogleSiteKitForm } from "@/components/admin/GoogleSiteKitForm";
import { GoogleAdsForm } from "@/components/admin/GoogleAdsForm";

export const metadata = { title: "Google Site Kit" };

export default async function GoogleSiteKitPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader
        title="Google Site Kit"
        description="Analytics, Search Console ve AdSense reklam ayarları. Yalnızca yönetici."
      />
      <div className="space-y-6">
        <GoogleSiteKitForm
          googleAnalyticsId={settings.googleAnalyticsId}
          googleTagManagerId={settings.googleTagManagerId}
          googleSiteVerification={settings.googleSiteVerification}
        />
        <GoogleAdsForm
          googleAdsenseClient={settings.googleAdsenseClient}
          googleAdsenseAutoAds={settings.googleAdsenseAutoAds}
        />
      </div>
    </>
  );
}
