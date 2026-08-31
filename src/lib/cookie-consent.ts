export const CONSENT_COOKIE = "rdk_consent";
export const CONSENT_EVENT = "rdk-consent";
export const CONSENT_OPEN_EVENT = "rdk-consent-open";
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365;

export type ConsentState = {
  v: 1;
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  ads: boolean;
};

export const DEFAULT_CONSENT: ConsentState = {
  v: 1,
  necessary: true,
  preferences: false,
  analytics: false,
  ads: false,
};

export function parseConsent(raw: string | null | undefined): ConsentState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(decodeURIComponent(raw)) as Partial<ConsentState>;
    if (data.v !== 1) return null;
    return {
      v: 1,
      necessary: true,
      preferences: Boolean(data.preferences),
      analytics: Boolean(data.analytics),
      ads: Boolean(data.ads),
    };
  } catch {
    return null;
  }
}

export function readConsentCookie(): ConsentState | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  return parseConsent(match.slice(CONSENT_COOKIE.length + 1));
}

export function writeConsentCookie(state: ConsentState) {
  const value = encodeURIComponent(JSON.stringify(state));
  document.cookie = `${CONSENT_COOKIE}=${value};path=/;max-age=${CONSENT_MAX_AGE};samesite=lax`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
}

export function acceptAllConsent(): ConsentState {
  return { v: 1, necessary: true, preferences: true, analytics: true, ads: true };
}

export function rejectOptionalConsent(): ConsentState {
  return { v: 1, necessary: true, preferences: false, analytics: false, ads: false };
}
