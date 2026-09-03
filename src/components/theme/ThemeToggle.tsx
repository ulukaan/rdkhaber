"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      suppressHydrationWarning
      className={cn(
        "relative inline-flex h-9 w-[4.25rem] shrink-0 items-center border border-border bg-surface p-0.5 transition-colors hover:border-brand",
        className,
      )}
      aria-label={dark ? "Açık temaya geç" : "Koyu temaya geç"}
      title={dark ? "Açık tema" : "Koyu tema"}
      aria-pressed={dark}
    >
      <span
        className={cn(
          "absolute top-0.5 h-8 w-8 bg-white shadow-sm transition-transform duration-200 ease-out lg:bg-brand",
          dark ? "translate-x-[1.65rem]" : "translate-x-0",
        )}
        aria-hidden
      />
      <span
        className={cn(
          "relative z-[1] flex h-8 w-8 items-center justify-center transition-colors",
          dark ? "text-white/70 lg:text-ink-soft" : "text-brand lg:text-white",
        )}
        aria-hidden
      >
        <Sun className="h-3.5 w-3.5" strokeWidth={2.25} />
      </span>
      <span
        className={cn(
          "relative z-[1] flex h-8 w-8 items-center justify-center transition-colors",
          dark ? "text-brand lg:text-white" : "text-white/70 lg:text-ink-soft",
        )}
        aria-hidden
      >
        <Moon className="h-3.5 w-3.5" strokeWidth={2.25} />
      </span>
    </button>
  );
}
