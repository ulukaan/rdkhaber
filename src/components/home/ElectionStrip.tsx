"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatElectionPercent } from "@/lib/election";

export function ElectionStrip({
  title,
  subtitle,
  boxPct,
  leadingName,
  leadingPct,
  href = "/secim",
}: {
  title: string;
  subtitle?: string | null;
  boxPct: number;
  leadingName?: string;
  leadingPct?: number;
  href?: string;
}) {
  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-[#111827] text-white shadow-sm" aria-label="Seçim özeti">
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70">Seçim</p>
          <h2 className="truncate text-base font-extrabold sm:text-lg">{title}</h2>
          {subtitle ? <p className="truncate text-xs text-white/70">{subtitle}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-semibold tabular-nums">Sandık {formatElectionPercent(boxPct)}</span>
          {leadingName ? (
            <span className="font-semibold">
              Önde: {leadingName}
              {leadingPct != null ? ` · ${formatElectionPercent(leadingPct)}` : ""}
            </span>
          ) : null}
          <Link href={href} className="inline-flex items-center gap-1 font-bold text-white hover:text-white/80">
            Tüm sonuçlar
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
