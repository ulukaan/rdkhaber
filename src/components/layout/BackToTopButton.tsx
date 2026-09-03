"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const viewport = window.innerHeight;
      const full = document.documentElement.scrollHeight;
      const nearBottom = scrollTop + viewport >= full - 320;
      const scrolledEnough = scrollTop > viewport * 0.6;
      setVisible(nearBottom && scrolledEnough);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Yukarı çık"
      title="Yukarı çık"
      className={cn(
        "fixed bottom-[5.75rem] right-4 z-50 flex h-12 w-12 flex-col items-center justify-center gap-0.5 border border-white/20 bg-brand text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)] transition-all duration-300 sm:bottom-[6.5rem] sm:right-5 sm:h-14 sm:w-14",
        "hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:scale-95",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      )}
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
      tabIndex={visible ? 0 : -1}
    >
      <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.4} aria-hidden />
      <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] sm:text-[10px]">
        Yukarı
      </span>
    </button>
  );
}
