"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Küçült / geri aç eşikleri ayrı — sticky yükseklik değişince scrollY salınımı olmasın. */
const COLLAPSE_Y = 96;
const EXPAND_Y = 12;

export function HeaderShell({
  prepend,
  top,
  main,
  extras,
}: {
  prepend?: React.ReactNode;
  top: React.ReactNode;
  main: React.ReactNode;
  extras: React.ReactNode;
}) {
  const [compact, setCompact] = useState(false);
  const compactRef = useRef(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        let next = compactRef.current;
        if (!compactRef.current && y > COLLAPSE_Y) next = true;
        else if (compactRef.current && y < EXPAND_Y) next = false;
        if (next === compactRef.current) return;
        compactRef.current = next;
        setCompact(next);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      className={cn("sticky top-0 z-50 bg-background shadow-sm", compact && "header-compact")}
    >
      {prepend}
      {top ? (
        <div className="header-collapse">
          <div className="header-collapse-inner">{top}</div>
        </div>
      ) : null}
      {main}
      {extras ? (
        <div className="header-collapse">
          <div className="header-collapse-inner">{extras}</div>
        </div>
      ) : null}
    </header>
  );
}
