import Image from "next/image";
import type { ElectionRaceType } from "@prisma/client";
import { computeVoteGap, formatElectionCount, formatElectionPercent, RACE_TYPE_LABELS } from "@/lib/election";
import { cn } from "@/lib/utils";

export type ElectionCandidateView = {
  id: string;
  raceType: ElectionRaceType;
  name: string;
  partyName: string;
  partyColor: string;
  photoUrl: string | null;
  slogan: string | null;
  votes: number;
  votePct: number;
  prevVotes: number | null;
  prevVotePct: number | null;
};

export function ElectionCandidateCards({
  candidates,
  raceType,
  boxPct,
}: {
  candidates: ElectionCandidateView[];
  raceType: ElectionRaceType;
  boxPct: number;
}) {
  const filtered = candidates
    .filter((item) => item.raceType === raceType)
    .sort((a, b) => b.votes - a.votes);
  if (filtered.length === 0) return null;

  const leaderGap = computeVoteGap(filtered);

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-ink">{RACE_TYPE_LABELS[raceType]}</h2>
          <p className="text-sm text-ink-soft">Açılan sandık: {formatElectionPercent(boxPct)}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((candidate, index) => (
          <article
            key={candidate.id}
            className={cn(
              "overflow-hidden rounded-2xl border bg-white shadow-sm",
              index === 0 ? "border-brand/40 ring-1 ring-brand/10" : "border-border",
            )}
          >
            <div className="flex items-stretch gap-0 sm:min-h-[132px]">
              <div
                className="flex w-28 shrink-0 flex-col items-center justify-center gap-2 bg-surface p-3 sm:w-32"
                style={{ borderBottom: `4px solid ${candidate.partyColor}` }}
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-full border border-border bg-white">
                  {candidate.photoUrl ? (
                    <Image src={candidate.photoUrl} alt="" fill className="object-cover" unoptimized />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-lg font-bold text-ink-soft">
                      {candidate.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                  style={{ backgroundColor: candidate.partyColor }}
                >
                  {candidate.partyName}
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center p-4">
                <h3 className="text-base font-extrabold text-ink sm:text-lg">{candidate.name}</h3>
                {candidate.slogan ? <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{candidate.slogan}</p> : null}
                <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-1">
                  <span className="text-2xl font-extrabold tabular-nums text-brand">{formatElectionPercent(candidate.votePct)}</span>
                  <span className="text-sm font-semibold tabular-nums text-ink">{formatElectionCount(candidate.votes)} oy</span>
                </div>
                {index === 0 && filtered.length > 1 ? (
                  <p className="mt-2 text-xs font-semibold text-emerald-700">
                    Oy farkı: +{formatElectionCount(leaderGap)}
                  </p>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ElectionResultsTable({
  candidates,
  raceType,
}: {
  candidates: ElectionCandidateView[];
  raceType: ElectionRaceType;
}) {
  const rows = candidates.filter((item) => item.raceType === raceType).sort((a, b) => b.votes - a.votes);
  if (rows.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <h2 className="text-sm font-bold text-ink">Detay tablo · {RACE_TYPE_LABELS[raceType]}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface text-[11px] font-bold uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3">Sıra</th>
              <th className="px-4 py-3">Parti</th>
              <th className="px-4 py-3">Aday</th>
              <th className="px-4 py-3">Oy</th>
              <th className="px-4 py-3">Oran</th>
              <th className="hidden px-4 py-3 sm:table-cell">2019 oy</th>
              <th className="hidden px-4 py-3 sm:table-cell">2019 %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-4 py-3 font-bold text-ink-soft">{index + 1}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2 font-semibold text-ink">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.partyColor }} />
                    {row.partyName}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-ink">{row.name}</td>
                <td className="px-4 py-3 tabular-nums">{formatElectionCount(row.votes)}</td>
                <td className="px-4 py-3 tabular-nums font-bold text-brand">{formatElectionPercent(row.votePct)}</td>
                <td className="hidden px-4 py-3 tabular-nums sm:table-cell">
                  {row.prevVotes != null ? formatElectionCount(row.prevVotes) : "—"}
                </td>
                <td className="hidden px-4 py-3 tabular-nums sm:table-cell">
                  {row.prevVotePct != null ? formatElectionPercent(row.prevVotePct) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
