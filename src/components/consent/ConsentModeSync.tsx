"use client";

import { useEffect } from "react";
import { CONSENT_EVENT, readConsentCookie } from "@/lib/cookie-consent";
import { applyConsentMode } from "@/lib/consent-mode";
import { notifyAdSenseRefresh } from "@/lib/adsense-runtime";

/** Kayıtlı çerez tercihini Consent Mode'a senkronize eder; reklam birimlerini yeniler. */
export function ConsentModeSync() {
  useEffect(() => {
    const sync = (state = readConsentCookie()) => {
      if (state) applyConsentMode(state);
      notifyAdSenseRefresh();
    };

    sync();

    const onChange = (event: Event) => {
      sync((event as CustomEvent).detail);
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  return null;
}
