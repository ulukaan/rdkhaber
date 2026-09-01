import type { ElectionRaceType } from "@prisma/client";
import { computeVoteGap, formatElectionCount, formatElectionPercent } from "@/lib/election";
import { ElectionCandidatePortrait } from "@/components/election/ElectionCandidatePortrait";
import type { ElectionCandidateView } from "@/components/election/ElectionCandidateCards";

export function ElectionDuelCard({
  candidates,
  raceType,
  boxPct,
  ntvCityId,
}: {
  candidates: ElectionCandidateView[];
  raceType: ElectionRaceType;
  boxPct: number;
  ntvCityId?: number | null;
}) {
  const sorted = candidates
    .filter((c) => c.raceType === raceType)
    .sort((a, b) => b.votes - a.votes);
  const first = sorted[0];
  const second = sorted[1];
  if (!first) return null;

  const gap = second ? computeVoteGap([first, second]) : 0;

  if (!second) {
    return (
      <div className="overflow-hidden rounded-b-xl border border-t-0 border-border bg-white p-5 shadow-sm">
        <SingleLeaderCard candidate={first} boxPct={boxPct} ntvCityId={ntvCityId} />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-b-xl border border-t-0 border-border bg-white shadow-sm">
      <div className="grid gap-0 md:grid-cols-[1fr_auto_1fr]">
        <CandidateSide candidate={first} align="left" ntvCityId={ntvCityId} />
        <div className="flex flex-col items-center justify-center border-y border-border bg-surface/50 px-4 py-5 md:border-x md:border-y-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">Oy farkı</p>
          <p className="mt-1 text-xl font-extrabold tabular-nums text-brand sm:text-2xl">
            +{formatElectionCount(gap)}
          </p>
        </div>
        <CandidateSide candidate={second} align="right" ntvCityId={ntvCityId} />
      </div>
      <div className="border-t border-border bg-surface/40 px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
        Açılan sandık oranı: {formatElectionPercent(boxPct)}
      </div>
    </div>
  );
}

function CandidateSide({
  candidate,
  align,
  ntvCityId,
}: {
  candidate: ElectionCandidateView;
  align: "left" | "right";
  ntvCityId?: number | null;
}) {
  return (
    <div className={`flex flex-col gap-3 p-4 sm:p-5 ${align === "right" ? "md:items-end md:text-right" : ""}`}>
      <div className={`flex items-center gap-3 ${align === "right" ? "md:flex-row-reverse" : ""}`}>
        <ElectionCandidatePortrait
          name={candidate.name}
          partyName={candidate.partyName}
          partyColor={candidate.partyColor}
          photoUrl={candidate.photoUrl}
          ntvCityId={ntvCityId}
          raceType={candidate.raceType}
          size="duel"
          badgeCorner={align === "right" ? "bottom-left" : "bottom-right"}
        />
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-ink sm:text-base">{candidate.name}</p>
          <p className="mt-0.5 text-[10px] font-bold uppercase text-ink-soft">{candidate.partyName}</p>
        </div>
      </div>
      <p
        className={`text-3xl font-extrabold tabular-nums sm:text-4xl ${align === "right" ? "md:text-right" : ""}`}
        style={{ color: candidate.partyColor }}
      >
        {formatElectionPercent(candidate.votePct)}
      </p>
      <div className="h-3 overflow-hidden rounded-sm bg-black/8">
        <div
          className="h-full rounded-sm transition-all"
          style={{ width: `${Math.min(100, candidate.votePct)}%`, backgroundColor: candidate.partyColor }}
        />
      </div>
      <p className="text-xs font-semibold tabular-nums text-ink-soft">{formatElectionCount(candidate.votes)} oy</p>
    </div>
  );
}

function SingleLeaderCard({
  candidate,
  boxPct,
  ntvCityId,
}: {
  candidate: ElectionCandidateView;
  boxPct: number;
  ntvCityId?: number | null;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <ElectionCandidatePortrait
        name={candidate.name}
        partyName={candidate.partyName}
        partyColor={candidate.partyColor}
        photoUrl={candidate.photoUrl}
        ntvCityId={ntvCityId}
        raceType={candidate.raceType}
        size="md"
      />
      <p className="mt-3 text-lg font-extrabold text-ink">{candidate.name}</p>
      <p className="mt-2 text-4xl font-extrabold tabular-nums" style={{ color: candidate.partyColor }}>
        {formatElectionPercent(candidate.votePct)}
      </p>
      <p className="mt-1 text-sm text-ink-soft">{formatElectionCount(candidate.votes)} oy</p>
      <p className="mt-3 text-[11px] font-semibold uppercase text-ink-soft">
        Açılan sandık: {formatElectionPercent(boxPct)}
      </p>
    </div>
  );
}
