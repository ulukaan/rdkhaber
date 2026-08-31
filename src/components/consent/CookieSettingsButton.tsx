"use client";

import { CONSENT_OPEN_EVENT } from "@/lib/cookie-consent";

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
    >
      Çerez ayarları
    </button>
  );
}
