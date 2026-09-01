import type { ConsentState } from "@/lib/cookie-consent";

export type ConsentModeUpdate = {
  ad_storage: "granted" | "denied";
  ad_user_data: "granted" | "denied";
  ad_personalization: "granted" | "denied";
  analytics_storage: "granted" | "denied";
  functionality_storage: "granted" | "denied";
  personalization_storage: "granted" | "denied";
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Consent Mode v2 — çerez tercihlerini Google etiketlerine yansıtır. */
export function consentStateToMode(state: ConsentState): ConsentModeUpdate {
  return {
    ad_storage: state.ads ? "granted" : "denied",
    ad_user_data: state.ads ? "granted" : "denied",
    ad_personalization: state.ads ? "granted" : "denied",
    analytics_storage: state.analytics ? "granted" : "denied",
    functionality_storage: state.preferences ? "granted" : "denied",
    personalization_storage: state.preferences ? "granted" : "denied",
  };
}

export function applyConsentMode(state: ConsentState) {
  if (typeof window === "undefined") return;
  window.gtag?.("consent", "update", consentStateToMode(state));
}
