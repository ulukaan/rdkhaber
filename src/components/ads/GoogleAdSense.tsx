import Script from "next/script";

/** Google AdSense — yayıncı kimliği doluysa script yükler. */
export function GoogleAdSense({
  client,
  autoAds,
}: {
  client: string;
  autoAds: boolean;
}) {
  const id = client.trim();
  if (!id || !autoAds) return null;

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(id)}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
