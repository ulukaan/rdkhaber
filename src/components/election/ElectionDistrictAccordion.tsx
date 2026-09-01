"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { computeBoxPct, formatElectionPercent } from "@/lib/election";
import { cn } from "@/lib/utils";
import type { ElectionDistrictView } from "@/components/election/ElectionDistrictGrid";

export function ElectionDistrictAccordion({
  districts,
  selectedSlug,
  onSelect,
}: {
  districts: ElectionDistrictView[];
  selectedSlug?: string | null;
  onSelect?: (slug: string | null) => void;
}) {
  const [openSlug, setOpenSlug] = useState<string | null>(selectedSlug ?? districts[0]?.slug ?? null);

  if (districts.length === 0) return null;

  function toggle(slug: string) {
    const next = openSlug === slug ? null : slug;
    setOpenSlug(next);
    onSelect?.(next);
  }

  return (
    <div className="divide-y divide-border border-t border-border">
      {districts.map((district) => {
        const open = openSlug === district.slug;
        const boxPct = computeBoxPct(district.openBoxes, district.totalBoxes);
        return (
          <div key={district.id}>
            <button
              type="button"
              onClick={() => toggle(district.slug)}
              className="flex w-full items-center justify-between gap-3 bg-white px-4 py-3.5 text-left transition-colors hover:bg-surface/50 sm:px-5"
            >
              <span className="font-extrabold text-ink">{district.name}</span>
              <span className="flex items-center gap-3">
                <span className="text-xs font-semibold tabular-nums text-ink-soft">
                  Sandık {formatElectionPercent(boxPct)}
                </span>
                <ChevronDown
                  className={cn("h-4 w-4 text-ink-soft transition-transform", open && "rotate-180")}
                />
              </span>
            </button>
            {open ? (
              <div className="border-t border-border bg-surface/30 px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-ink-soft">
                    Katılım: <strong className="text-ink">%{district.turnoutPct.toFixed(1)}</strong>
                  </span>
                  {district.leadingName ? (
                    <span className="text-sm text-ink">
                      Önde: <strong>{district.leadingName}</strong>
                      {district.leadingParty ? ` (${district.leadingParty})` : ""}
                      {district.leadingPct != null ? ` · ${formatElectionPercent(district.leadingPct)}` : ""}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
