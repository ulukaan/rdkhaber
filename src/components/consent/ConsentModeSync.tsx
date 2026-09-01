"use client";

import { useEffect } from "react";
import { CONSENT_EVENT, readConsentCookie, type ConsentState } from "@/lib/cookie-consent";
import { applyConsentMode } from "@/lib/consent-mode";

/** Kayıtlı çerez tercihini Consent Mode'a senkronize eder. */
export function ConsentModeSync() {
  useEffect(() => {
    const stored = readConsentCookie();
    if (stored) applyConsentMode(stored);

    const onChange = (event: Event) => {
      applyConsentMode((event as CustomEvent<ConsentState>).detail);
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  return null;
}
