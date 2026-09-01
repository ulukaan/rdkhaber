import { Box, Users, Vote, CheckCircle2, BarChart3, Layers } from "lucide-react";
import { computeBoxPct, formatElectionCount, formatElectionPercent } from "@/lib/election";
import { cn } from "@/lib/utils";

export function ElectionKpiGrid({
  totalBoxes,
  openBoxes,
  totalVoters,
  usedVotes,
  validVotes,
  variant = "light",
}: {
  totalBoxes: number;
  openBoxes: number;
  totalVoters: number;
  usedVotes: number;
  validVotes: number;
  variant?: "light" | "dark" | "ntv";
}) {
  const boxPct = computeBoxPct(openBoxes, totalBoxes);
  const items = [
    { label: "Toplam sandık", value: formatElectionCount(totalBoxes), Icon: Layers },
    { label: "Açılan sandık", value: formatElectionCount(openBoxes), Icon: Box },
    { label: "Sandık oranı", value: formatElectionPercent(boxPct), Icon: BarChart3, highlight: true },
    { label: "Toplam seçmen", value: formatElectionCount(totalVoters), Icon: Users },
    { label: "Kullanılan oy", value: formatElectionCount(usedVotes), Icon: Vote },
    { label: "Geçerli oy", value: formatElectionCount(validVotes), Icon: CheckCircle2 },
  ];

  if (variant === "ntv") {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center bg-brand-dark text-white shadow-sm sm:h-16 sm:w-16">
              <item.Icon className="h-6 w-6" aria-hidden />
            </div>
            <p className="mt-2 text-[10px] font-bold uppercase leading-tight tracking-wide text-ink-soft sm:text-[11px]">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-extrabold tabular-nums text-ink sm:text-base">{item.value}</p>
          </div>
        ))}
      </div>
    );
  }

  const dark = variant === "dark";

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-6">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "border p-3 sm:p-3.5",
            dark
              ? "border-white/10 bg-white/5 text-white"
              : "border-border bg-white shadow-sm",
            item.highlight && dark && "border-brand/40 bg-brand/10",
          )}
        >
          <div className={cn("mb-1.5 flex items-center gap-1.5", dark ? "text-white/70" : "text-brand")}>
            <item.Icon className="h-3.5 w-3.5" aria-hidden />
            <span className={cn("text-[10px] font-bold uppercase tracking-wide", dark ? "text-white/60" : "text-ink-soft")}>
              {item.label}
            </span>
          </div>
          <p className={cn("text-base font-extrabold tabular-nums sm:text-lg", dark ? "text-white" : "text-ink")}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function ElectionBoxProgress({
  openBoxes,
  totalBoxes,
  className,
}: {
  openBoxes: number;
  totalBoxes: number;
  className?: string;
}) {
  const pct = computeBoxPct(openBoxes, totalBoxes);
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
        <span className="text-white/70">Sandık açılma</span>
        <span className="tabular-nums text-white">{formatElectionPercent(pct)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-orange-400 transition-all duration-700"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-white/50">
        {formatElectionCount(openBoxes)} / {formatElectionCount(totalBoxes)} sandık
      </p>
    </div>
  );
}
