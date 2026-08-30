"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PanelCard } from "@/components/admin/PanelUI";

/** Form altındaki "Ek Ayarlar", "SEO Meta" gibi katlanabilir bölümler. */
export function CollapsibleSection({
  title,
  description,
  defaultOpen = false,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <PanelCard padding={false}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="min-w-0">
          <span className="block text-sm font-bold text-ink">{title}</span>
          {description ? (
            <span className="mt-0.5 block text-xs text-ink-soft">{description}</span>
          ) : null}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-ink-soft transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? <div className="border-t border-border p-5">{children}</div> : null}
    </PanelCard>
  );
}
