/** AdSense script yüklendiğinde tetiklenir. */
export const ADSENSE_SCRIPT_READY = "rdk-adsense-script-ready";

/** Çerez tercihi değişince reklamları yeniden dener. */
export const ADSENSE_REFRESH = "rdk-adsense-refresh";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function requestAdSenseFill() {
  try {
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
    return true;
  } catch {
    return false;
  }
}

export function notifyAdSenseRefresh() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADSENSE_REFRESH));
}

export function notifyAdSenseScriptReady() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADSENSE_SCRIPT_READY));
}

/** Slot koduna göre AdSense birim biçimini düzeltir (in-article yalnızca paragraf slotlarında). */
export function resolveAdsensePlacement(
  slotCode: string,
  layout?: string | null,
  format?: string | null,
) {
  const inArticleSlots = new Set(["1003", "121"]);
  if (inArticleSlots.has(slotCode)) {
    return {
      layout: layout?.trim() || "in-article",
      format: format?.trim() || "fluid",
      fullWidthResponsive: false,
    };
  }

  // Banner / manşet slotlarında in-article kodu doldurulmaz — görüntülü reklama çevir.
  return {
    layout: null as string | null,
    format: "auto",
    fullWidthResponsive: true,
  };
}
