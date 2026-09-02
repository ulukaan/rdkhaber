"use client";

import { useEffect, useState } from "react";
import { CONSENT_EVENT, readConsentCookie } from "@/lib/cookie-consent";
import { GoogleAdUnit } from "@/components/ads/GoogleAdUnit";

type Props = {
  client: string;
  slot: string;
  layout?: string | null;
  format?: string | null;
  label: string;
  className?: string;
};

/** Reklam çerezi yoksa boş kutu göstermez; onay sonrası AdSense birimini yükler. */
export function GoogleAdUnitGate({ client, slot, layout, format, label, className }: Props) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const sync = () => setAllowed(readConsentCookie()?.ads === true);
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!allowed) return null;

  return (
    <aside
      className={className ?? "flex justify-center py-3"}
      aria-label={`Reklam ${label}`}
    >
      <div className="w-full max-w-full">
        <span className="mb-1 block text-center text-[10px] font-semibold uppercase tracking-widest text-ink-soft">
          Reklam
        </span>
        <GoogleAdUnit client={client} slot={slot} layout={layout} format={format} />
      </div>
    </aside>
  );
}
