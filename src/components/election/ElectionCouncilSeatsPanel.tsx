import type { CouncilSeatView } from "@/lib/election-engine";

export function ElectionCouncilSeatsPanel({
  seats,
  totalSeats,
}: {
  seats: CouncilSeatView[];
  totalSeats?: number;
}) {
  if (seats.length === 0) return null;

  const allocated = seats.reduce((sum, row) => sum + row.seats, 0);
  const maxSeats = totalSeats ?? allocated;

  return (
    <section className="overflow-hidden border border-border bg-white shadow-sm">
      <div className="border-b border-border bg-brand-dark px-4 py-3 text-white sm:px-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wide sm:text-base">Meclis sandalye dağılımı</h2>
        <p className="mt-0.5 text-xs text-white/70">D&apos;Hondt yöntemi · {allocated}/{maxSeats} sandalye</p>
      </div>
      <div className="divide-y divide-border">
        {seats.map((row) => {
          const widthPct = maxSeats > 0 ? (row.seats / maxSeats) * 100 : 0;
          return (
            <div key={`${row.allianceId ?? row.partyId ?? row.label}`} className="px-4 py-3 sm:px-5">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: row.color }}
                    aria-hidden
                  />
                  <span className="text-sm font-bold text-ink">{row.label}</span>
                </div>
                <span className="text-sm font-extrabold tabular-nums text-ink">{row.seats}</span>
              </div>
              <div className="h-2 overflow-hidden bg-surface">
                <div
                  className="h-full transition-all"
                  style={{ width: `${widthPct}%`, backgroundColor: row.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
