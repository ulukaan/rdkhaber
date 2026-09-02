"use client";

import { useEffect, useId, useRef } from "react";
import { CONSENT_EVENT } from "@/lib/cookie-consent";
import {
  ADSENSE_REFRESH,
  ADSENSE_SCRIPT_READY,
  requestAdSenseFill,
} from "@/lib/adsense-runtime";

type Props = {
  client: string;
  slot: string;
  slotCode: string;
  layout?: string | null;
  format?: string | null;
  label: string;
  className?: string;
};

/** Google AdSense manuel birimi — script hazır olunca doldurulur. */
export function GoogleAdUnit({
  client,
  slot,
  slotCode,
  layout,
  format,
  label,
  className,
}: Props) {
  const insRef = useRef<HTMLModElement>(null);
  const uid = useId();

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    let attempts = 0;

    const scriptReady = () =>
      Boolean(document.querySelector('script[src*="adsbygoogle.js"]'));

    const tryFill = () => {
      if (cancelled || !insRef.current) return;
      if (!scriptReady()) {
        timer = window.setTimeout(tryFill, 300);
        return;
      }
      attempts += 1;
      requestAdSenseFill();

      const filled =
        insRef.current.querySelector("iframe") ||
        insRef.current.getAttribute("data-ad-status") === "filled";
      if (filled || attempts >= 60) return;
      timer = window.setTimeout(tryFill, 500);
    };

    const schedule = () => {
      if (cancelled) return;
      attempts = 0;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(tryFill);
      });
    };

    schedule();
    window.addEventListener(ADSENSE_SCRIPT_READY, schedule);
    window.addEventListener(ADSENSE_REFRESH, schedule);
    window.addEventListener(CONSENT_EVENT, schedule);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      window.removeEventListener(ADSENSE_SCRIPT_READY, schedule);
      window.removeEventListener(ADSENSE_REFRESH, schedule);
      window.removeEventListener(CONSENT_EVENT, schedule);
    };
  }, [client, slot, slotCode, layout, format, uid]);

  const attrs: Record<string, string> = {
    className: "adsbygoogle",
    "data-ad-client": client,
    "data-ad-slot": slot,
  };
  if (layout) attrs["data-ad-layout"] = layout;
  if (format) attrs["data-ad-format"] = format;
  if (!layout) attrs["data-full-width-responsive"] = "true";

  return (
    <aside
      className={className ?? "flex justify-center py-3"}
      aria-label={`Reklam ${label}`}
    >
      <div className="w-full max-w-full">
        <span className="mb-1 block text-center text-[10px] font-semibold uppercase tracking-widest text-ink-soft">
          Reklam
        </span>
        <ins ref={insRef} {...attrs} style={{ display: "block", textAlign: "center", minHeight: 90 }} />
      </div>
    </aside>
  );
}
