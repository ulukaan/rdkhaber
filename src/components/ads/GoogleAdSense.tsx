"use client";

import Script from "next/script";
import { notifyAdSenseScriptReady } from "@/lib/adsense-runtime";

/** Google AdSense — yayıncı kimliği doluysa ve manuel/otomatik reklam açıksa script yükler. */
export function GoogleAdSense({
  client,
  enabled,
}: {
  client: string;
  enabled: boolean;
}) {
  const id = client.trim();
  if (!id || !enabled) return null;

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(id)}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
      onLoad={() => notifyAdSenseScriptReady()}
    />
  );
}
