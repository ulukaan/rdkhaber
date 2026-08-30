"use client";

import { useTransition } from "react";
import { Menu } from "lucide-react";
import { toggleCategoryInHeaderNavAction } from "@/actions/appearance";
import { cn } from "@/lib/utils";

export function CategoryHeaderNavToggle({
  categoryId,
  inNav,
}: {
  categoryId: string;
  inNav: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      title={inNav ? "Üst menüden çıkar" : "Üst menüye ekle"}
      aria-label={inNav ? "Üst menüden çıkar" : "Üst menüye ekle"}
      aria-pressed={inNav}
      onClick={() => {
        start(async () => {
          await toggleCategoryInHeaderNavAction(categoryId);
        });
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide transition-colors disabled:opacity-50",
        inNav
          ? "bg-brand text-white hover:bg-brand-dark"
          : "bg-surface text-ink-soft hover:bg-brand/10 hover:text-brand",
      )}
    >
      <Menu className="h-3.5 w-3.5" />
      {pending ? "…" : inNav ? "Menüde" : "Menüye ekle"}
    </button>
  );
}
