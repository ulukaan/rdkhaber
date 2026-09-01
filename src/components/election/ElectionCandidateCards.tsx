import Image from "next/image";
import type { ElectionRaceType } from "@prisma/client";
import { computeVoteGap, formatElectionCount, formatElectionPercent, RACE_TYPE_LABELS } from "@/lib/election";
import { resolveCandidatePhotoUrl } from "@/lib/election-candidate-photo";
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

function VoteBar({ pct, color, className }: { pct: number; color: string; className?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-black/8", className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function ElectionLeaderPodium({
  candidates,
  raceType,
}: {
  candidates: ElectionCandidateView[];
  raceType: ElectionRaceType;
}) {
  const top = candidates
    .filter((item) => item.raceType === raceType)
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 3);
  if (top.length === 0) return null;

  const leaderGap = computeVoteGap(top);
  const podiumOrder = top.length === 3 ? [top[1], top[0], top[2]] : top;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-[#111827] to-[#1e293b] p-4 text-white shadow-lg sm:p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">Öne çıkan adaylar</p>
          <h2 className="text-xl font-extrabold sm:text-2xl">{RACE_TYPE_LABELS[raceType]}</h2>
        </div>
        {top[0] && top.length > 1 ? (
          <p className="text-sm font-semibold text-emerald-300">
            Lider farkı: +{formatElectionCount(leaderGap)} oy
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          "grid items-end gap-3 sm:gap-4",
          top.length === 1 ? "max-w-sm" : top.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3",
        )}
      >
        {podiumOrder.map((candidate) => {
          const rank = top.indexOf(candidate) + 1;
          const photoSrc = resolveCandidatePhotoUrl(candidate);
          const isLeader = rank === 1;
          return (
            <article
              key={candidate.id}
              className={cn(
                "relative flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm",
                isLeader ? "order-2 sm:order-none sm:-mt-2 sm:pb-6" : rank === 2 ? "order-1 sm:order-none" : "order-3 sm:order-none",
                isLeader && "border-brand/40 bg-white/10 ring-1 ring-brand/30",
              )}
            >
              <span
                className={cn(
                  "absolute -top-2.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold",
                  isLeader ? "bg-brand text-white" : "bg-white/20 text-white",
                )}
              >
                {rank}
              </span>
              <div
                className={cn(
                  "relative overflow-hidden rounded-full border-2 border-white/20 bg-white",
                  isLeader ? "h-20 w-20 sm:h-24 sm:w-24" : "h-16 w-16 sm:h-[72px] sm:w-[72px]",
                )}
              >
                <Image src={photoSrc} alt="" fill className="object-cover" unoptimized />
              </div>
              <span
                className="mt-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: candidate.partyColor }}
              >
                {candidate.partyName}
              </span>
              <h3 className={cn("mt-2 text-center font-extrabold", isLeader ? "text-lg" : "text-sm")}>
                {candidate.name}
              </h3>
              <p className="mt-1 text-2xl font-extrabold tabular-nums text-brand sm:text-3xl">
                {formatElectionPercent(candidate.votePct)}
              </p>
              <p className="mt-0.5 text-xs font-semibold tabular-nums text-white/70">
                {formatElectionCount(candidate.votes)} oy
              </p>
              <VoteBar pct={candidate.votePct} color={candidate.partyColor} className="mt-3 w-full" />
            </article>
          );
        })}
      </div>
    </section>
  );
}

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
  const rest = filtered.slice(3);
  if (rest.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-ink">Diğer adaylar</h2>
          <p className="text-sm text-ink-soft">Açılan sandık: {formatElectionPercent(boxPct)}</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <ul className="divide-y divide-border">
          {rest.map((candidate, index) => {
            const photoSrc = resolveCandidatePhotoUrl(candidate);
            const rank = index + 4;
            return (
              <li key={candidate.id} className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-sm font-extrabold text-ink-soft">
                  {rank}
                </span>
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border bg-surface">
                  <Image src={photoSrc} alt="" fill className="object-cover" unoptimized />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="font-extrabold text-ink">{candidate.name}</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                      style={{ backgroundColor: candidate.partyColor }}
                    >
                      {candidate.partyName}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <VoteBar pct={candidate.votePct} color={candidate.partyColor} className="flex-1" />
                    <span className="shrink-0 text-sm font-extrabold tabular-nums text-brand">
                      {formatElectionPercent(candidate.votePct)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold tabular-nums text-ink-soft">
                    {formatElectionCount(candidate.votes)} oy
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function ElectionResultsTable({
  candidates,
  raceType,
  bare = false,
}: {
  candidates: ElectionCandidateView[];
  raceType: ElectionRaceType;
  bare?: boolean;
}) {
  const rows = candidates.filter((item) => item.raceType === raceType).sort((a, b) => b.votes - a.votes);
  if (rows.length === 0) return null;

  return (
    <section className={cn(!bare && "overflow-hidden border border-border bg-white shadow-sm")}>
      {!bare ? (
        <div className="border-b border-border bg-surface/60 px-4 py-3.5 sm:px-5">
          <h2 className="text-sm font-extrabold text-ink">Detaylı sonuç tablosu</h2>
          <p className="mt-0.5 text-xs text-ink-soft">{RACE_TYPE_LABELS[raceType]} · tüm adaylar</p>
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-surface text-[11px] font-bold uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3 sm:px-5">Sıra</th>
              <th className="px-4 py-3 sm:px-5">Parti</th>
              <th className="px-4 py-3 sm:px-5">Aday</th>
              <th className="px-4 py-3 sm:px-5">Alınan oy</th>
              <th className="min-w-[100px] px-4 py-3 sm:px-5">Oy oranı</th>
              <th className="hidden px-4 py-3 sm:table-cell sm:px-5">2019 alınan oy</th>
              <th className="hidden px-4 py-3 sm:table-cell sm:px-5">2019 oy oranı</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className={cn(
                  "border-t border-border transition-colors hover:bg-surface/40",
                  index === 0 && "bg-brand/[0.03]",
                )}
              >
                <td className="px-4 py-3 font-extrabold text-ink-soft sm:px-5">{index + 1}</td>
                <td className="px-4 py-3 sm:px-5">
                  <span className="inline-flex items-center gap-2 font-bold uppercase text-ink">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.partyColor }} />
                    {row.partyName}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-brand sm:px-5">{row.name}</td>
                <td className="px-4 py-3 font-semibold tabular-nums sm:px-5">{formatElectionCount(row.votes)}</td>
                <td className="px-4 py-3 sm:px-5">
                  <span className="font-extrabold tabular-nums text-brand">
                    {formatElectionPercent(row.votePct)}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-xs tabular-nums text-ink-soft sm:table-cell sm:px-5">
                  {row.prevVotes != null ? formatElectionCount(row.prevVotes) : "—"}
                </td>
                <td className="hidden px-4 py-3 text-xs tabular-nums text-ink-soft sm:table-cell sm:px-5">
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
