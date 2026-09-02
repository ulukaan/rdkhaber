"use client";

import { useEffect, useRef } from "react";
import { CONSENT_EVENT, readConsentCookie } from "@/lib/cookie-consent";

type Props = {
  client: string;
  slot: string;
  layout?: string | null;
  format?: string | null;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

function adsConsentGranted() {
  const consent = readConsentCookie();
  return consent?.ads === true;
}

function requestAdFill() {
  try {
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
    return true;
  } catch {
    return false;
  }
}

/** Google AdSense manuel birimi — script ve çerez onayı sonrası doldurulur. */
export function GoogleAdUnit({ client, slot, layout, format }: Props) {
  const insRef = useRef<HTMLModElement>(null);
  const filledRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const tryFill = () => {
      if (cancelled || filledRef.current) return;
      if (!adsConsentGranted()) return;
      if (requestAdFill()) {
        filledRef.current = true;
        return;
      }
      timer = window.setTimeout(tryFill, 400);
    };

    tryFill();

    const onConsent = () => {
      filledRef.current = false;
      tryFill();
    };
    window.addEventListener(CONSENT_EVENT, onConsent);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      window.removeEventListener(CONSENT_EVENT, onConsent);
    };
  }, [client, slot, layout, format]);

  const attrs: Record<string, string> = {
    className: "adsbygoogle",
    "data-ad-client": client,
    "data-ad-slot": slot,
  };
  if (layout) attrs["data-ad-layout"] = layout;
  if (format) attrs["data-ad-format"] = format;
  if (!layout) attrs["data-full-width-responsive"] = "true";

  return (
    <ins
      ref={insRef}
      {...attrs}
      style={{ display: "block", textAlign: "center", minHeight: 90 }}
    />
  );
}
