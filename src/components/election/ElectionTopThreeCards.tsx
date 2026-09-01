import type { ElectionRaceType } from "@prisma/client";
import { computeVoteGap, formatElectionCount, formatElectionPercent } from "@/lib/election";
import { ElectionCandidatePortrait } from "@/components/election/ElectionCandidatePortrait";
import { resolvePartyColor } from "@/lib/election-candidate-photo";
import type { ElectionCandidateView } from "@/components/election/ElectionCandidateCards";

function GapBadge({ gap }: { gap: number }) {
  return (
    <div className="flex flex-col items-center justify-center self-center px-2 py-4 sm:px-3">
      <div className="border border-brand/30 bg-brand/5 px-3 py-2 text-center shadow-sm">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-brand">Oy farkı</p>
        <p className="mt-0.5 text-base font-extrabold tabular-nums text-brand sm:text-lg">
          +{formatElectionCount(gap)}
        </p>
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  ntvCityId,
  ntvDistrictId,
}: {
  candidate: ElectionCandidateView;
  ntvCityId?: number | null;
  ntvDistrictId?: number | null;
}) {
  const partyColor = resolvePartyColor(candidate.partyName, candidate.partyColor);
  return (
    <article className="flex flex-1 flex-col items-center bg-white px-3 py-5 text-center sm:px-4 sm:py-6">
      <ElectionCandidatePortrait
        name={candidate.name}
        partyName={candidate.partyName}
        partyColor={partyColor}
        photoUrl={candidate.photoUrl}
        ntvCityId={ntvCityId}
        ntvDistrictId={ntvDistrictId}
        raceType={candidate.raceType}
        size="lg"
      />
      <p className="mt-3 text-xs font-extrabold uppercase tracking-wide text-ink sm:text-sm">{candidate.name}</p>
      <p className="mt-2 text-3xl font-extrabold tabular-nums sm:text-4xl" style={{ color: partyColor }}>
        {formatElectionPercent(candidate.votePct)}
      </p>
      <p className="mt-1 text-sm font-bold tabular-nums text-ink">{formatElectionCount(candidate.votes)}</p>
    </article>
  );
}

export function ElectionTopThreeCards({
  candidates,
  raceType,
  boxPct,
  ntvCityId,
  ntvDistrictId,
}: {
  candidates: ElectionCandidateView[];
  raceType: ElectionRaceType;
  boxPct: number;
  ntvCityId?: number | null;
  ntvDistrictId?: number | null;
}) {
  const top = candidates
    .filter((c) => c.raceType === raceType)
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 3);
  if (top.length === 0) return null;

  const gap12 = top.length >= 2 ? computeVoteGap([top[0]!, top[1]!]) : 0;
  const gap23 = top.length >= 3 ? computeVoteGap([top[1]!, top[2]!]) : 0;

  return (
    <div className="overflow-hidden border-t border-border bg-white">
      <div className="flex flex-col divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
        <CandidateCard candidate={top[0]!} ntvCityId={ntvCityId} ntvDistrictId={ntvDistrictId} />
        {top[1] ? (
          <>
            <GapBadge gap={gap12} />
            <CandidateCard candidate={top[1]} ntvCityId={ntvCityId} ntvDistrictId={ntvDistrictId} />
          </>
        ) : null}
        {top[2] ? (
          <>
            <GapBadge gap={gap23} />
            <CandidateCard candidate={top[2]} ntvCityId={ntvCityId} ntvDistrictId={ntvDistrictId} />
          </>
        ) : null}
      </div>
      <div className="border-t border-border bg-surface px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
        Açılan sandık oranı: {formatElectionPercent(boxPct)}
      </div>
    </div>
  );
}
