"use client";

import type { ConsentState } from "@/lib/cookie-consent";

/** Onay sonrası yalnızca özel gövde HTML'i — GA/GTM/AdSense layout'ta Consent Mode ile yüklenir. */
export function ConsentScripts({
  consent,
  customBodyEndHtml,
}: {
  consent: ConsentState | null;
  customBodyEndHtml: string;
}) {
  if (!consent?.analytics || !customBodyEndHtml) return null;

  return <div dangerouslySetInnerHTML={{ __html: customBodyEndHtml }} />;
}
