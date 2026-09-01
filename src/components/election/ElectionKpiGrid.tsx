import { Box, Users, Vote, CheckCircle2, BarChart3, Layers } from "lucide-react";
import { computeBoxPct, formatElectionCount, formatElectionPercent } from "@/lib/election";

export function ElectionKpiGrid({
  totalBoxes,
  openBoxes,
  totalVoters,
  usedVotes,
  validVotes,
}: {
  totalBoxes: number;
  openBoxes: number;
  totalVoters: number;
  usedVotes: number;
  validVotes: number;
}) {
  const boxPct = computeBoxPct(openBoxes, totalBoxes);
  const items = [
    { label: "Toplam sandık", value: formatElectionCount(totalBoxes), Icon: Layers },
    { label: "Açılan sandık", value: formatElectionCount(openBoxes), Icon: Box },
    { label: "Sandık oranı", value: formatElectionPercent(boxPct), Icon: BarChart3 },
    { label: "Toplam seçmen", value: formatElectionCount(totalVoters), Icon: Users },
    { label: "Kullanılan oy", value: formatElectionCount(usedVotes), Icon: Vote },
    { label: "Geçerli oy", value: formatElectionCount(validVotes), Icon: CheckCircle2 },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-border bg-white p-3 shadow-sm sm:p-4">
          <div className="mb-2 flex items-center gap-2 text-brand">
            <item.Icon className="h-4 w-4" aria-hidden />
            <span className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">{item.label}</span>
          </div>
          <p className="text-lg font-extrabold tabular-nums text-ink sm:text-xl">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
