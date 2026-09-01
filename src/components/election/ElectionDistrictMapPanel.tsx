import { formatElectionCount, formatElectionPercent } from "@/lib/election";
import { ElectionDuzceMap } from "@/components/election/ElectionDuzceMap";
import { ElectionNationalPartyTable } from "@/components/election/ElectionNationalPartyTable";
import type { ElectionDistrictView } from "@/components/election/ElectionDistrictGrid";

type PartyWinRow = {
  partyName: string;
  partyColor: string;
  votes: number;
  districtsWon: number;
};

function buildPartyWins(districts: ElectionDistrictView[]): PartyWinRow[] {
  const map = new Map<string, PartyWinRow>();
  for (const district of districts) {
    if (!district.leadingParty || !district.leadingPartyColor) continue;
    const key = district.leadingParty;
    const existing = map.get(key) ?? {
      partyName: district.leadingParty,
      partyColor: district.leadingPartyColor,
      votes: 0,
      districtsWon: 0,
    };
    existing.votes += district.leadingVotes ?? 0;
    existing.districtsWon += 1;
    map.set(key, existing);
  }
  return [...map.values()].sort((a, b) => b.districtsWon - a.districtsWon || b.votes - a.votes);
}

export function ElectionDistrictMapPanel({
  districts,
  selectedSlug,
}: {
  districts: ElectionDistrictView[];
  selectedSlug?: string | null;
}) {
  if (districts.length === 0) return null;

  const partyWins = buildPartyWins(districts);
  const hasLeaders = districts.some((d) => d.leadingParty);

  return (
    <div className="grid gap-0 border-t border-border xl:grid-cols-[1fr_360px]">
      <div className="border-b border-border p-4 sm:p-5 xl:border-b-0 xl:border-r">
        <ElectionDuzceMap districts={districts} selectedSlug={selectedSlug} />
      </div>

      <div className="divide-y divide-border">
        <div className="p-4 sm:p-5">
          <h3 className="mb-3 text-[11px] font-bold uppercase leading-snug tracking-wide text-ink-soft">
            Düzce geneli kazanılan belediye sayısı (ilçe)
          </h3>
          {hasLeaders ? (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                  <th className="pb-2 pr-2">Parti</th>
                  <th className="pb-2 pr-2 text-right">Alınan oy</th>
                  <th className="pb-2 text-right">Kazanılan</th>
                </tr>
              </thead>
              <tbody>
                {partyWins.map((row) => (
                  <tr key={row.partyName} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-2">
                      <span className="inline-flex items-center gap-2 font-bold text-ink">
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: row.partyColor }} />
                        <span className="text-xs uppercase">{row.partyName}</span>
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 text-right text-xs font-semibold tabular-nums text-ink">
                      {formatElectionCount(row.votes)}
                    </td>
                    <td className="py-2.5 text-right text-xs font-extrabold tabular-nums text-brand">
                      {row.districtsWon}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-sm text-ink-soft">İlçe bazlı sonuçlar henüz girilmedi.</p>
          )}
        </div>
        <ElectionNationalPartyTable />
      </div>
    </div>
  );
}

export function ElectionDistrictLeaderTable({ districts }: { districts: ElectionDistrictView[] }) {
  const rows = districts.filter((d) => d.leadingName);

  return (
    <div className="overflow-x-auto">
      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-ink-soft sm:px-5">
          İlçe bazlı aday sonuçları henüz girilmedi.
        </p>
      ) : (
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-surface text-[11px] font-bold uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3 sm:px-5">İlçe</th>
              <th className="px-4 py-3 sm:px-5">Parti</th>
              <th className="px-4 py-3 sm:px-5">Aday</th>
              <th className="px-4 py-3 text-right sm:px-5">Alınan oy</th>
              <th className="px-4 py-3 text-right sm:px-5">Oy oranı</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((district) => (
              <tr key={district.id} className="border-b border-border/70 transition-colors hover:bg-surface/40">
                <td className="px-4 py-3 font-extrabold uppercase text-ink sm:px-5">{district.name}</td>
                <td className="px-4 py-3 sm:px-5">
                  <span className="inline-flex items-center gap-2 font-bold uppercase text-ink">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: district.leadingPartyColor ?? "#9ca3af" }}
                    />
                    {district.leadingParty}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-brand sm:px-5">{district.leadingName}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums sm:px-5">
                  {district.leadingVotes != null ? formatElectionCount(district.leadingVotes) : "—"}
                </td>
                <td className="px-4 py-3 text-right font-extrabold tabular-nums text-brand sm:px-5">
                  {district.leadingPct != null ? formatElectionPercent(district.leadingPct) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
