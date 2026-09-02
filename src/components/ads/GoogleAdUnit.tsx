"use client";

import { useEffect, useRef } from "react";

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

/** Google AdSense manuel reklam birimi — slot panelden veya kod yapıştırmasından gelir. */
export function GoogleAdUnit({ client, slot, layout, format }: Props) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushed.current = true;
    } catch {
      // AdSense script henüz yüklenmemiş olabilir; bir sonraki render'da tekrar dener.
    }
  }, [client, slot, layout, format]);

  const attrs: Record<string, string> = {
    className: "adsbygoogle",
    "data-ad-client": client,
    "data-ad-slot": slot,
  };
  if (layout) attrs["data-ad-layout"] = layout;
  if (format) attrs["data-ad-format"] = format;

  return (
    <ins
      {...attrs}
      style={{ display: "block", textAlign: "center", minHeight: 90 }}
    />
  );
}
