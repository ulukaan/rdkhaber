"use client";

import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import { GoogleAdSense } from "@/components/ads/GoogleAdSense";
import type { ConsentState } from "@/lib/cookie-consent";

export function ConsentScripts({
  consent,
  gaId,
  gtmId,
  adsenseClient,
  adsenseAuto,
  customBodyEndHtml,
}: {
  consent: ConsentState | null;
  gaId: string;
  gtmId: string;
  adsenseClient: string;
  adsenseAuto: boolean;
  customBodyEndHtml: string;
}) {
  if (!consent) return null;

  return (
    <>
      {consent.analytics && gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
      {consent.analytics && !gtmId && gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      {consent.ads ? <GoogleAdSense client={adsenseClient} autoAds={adsenseAuto} /> : null}
      {consent.analytics && customBodyEndHtml ? (
        <div dangerouslySetInnerHTML={{ __html: customBodyEndHtml }} />
      ) : null}
    </>
  );
}
