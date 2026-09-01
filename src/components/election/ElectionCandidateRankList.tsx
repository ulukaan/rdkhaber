import type { ElectionRaceType } from "@prisma/client";
import { formatElectionCount, formatElectionPercent } from "@/lib/election";
import { ElectionCandidatePortrait } from "@/components/election/ElectionCandidatePortrait";
import type { ElectionCandidateView } from "@/components/election/ElectionCandidateCards";
export function ElectionCandidateRankList({
  candidates,
  raceType,
  limit = 8,
  ntvCityId,
}: {
  candidates: ElectionCandidateView[];
  raceType: ElectionRaceType;
  limit?: number;
  ntvCityId?: number | null;
}) {
  const rows = candidates
    .filter((c) => c.raceType === raceType)
    .sort((a, b) => b.votes - a.votes)
    .slice(0, limit);

  if (rows.length === 0) return null;

  return (
    <ul className="divide-y divide-border">
      {rows.map((candidate, index) => {
        return (
          <li key={candidate.id} className="flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
            <ElectionCandidatePortrait
              name={candidate.name}
              partyName={candidate.partyName}
              partyColor={candidate.partyColor}
              photoUrl={candidate.photoUrl}
              ntvCityId={ntvCityId}
              raceType={candidate.raceType}
              size="xs"
            />            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-extrabold text-white"
                  style={{ backgroundColor: candidate.partyColor }}
                  title={candidate.partyName}
                >
                  {index + 1}
                </span>
                <p className="truncate font-extrabold text-[#1d4ed8]">{candidate.name}</p>
              </div>
              <p className="mt-0.5 text-[11px] font-semibold uppercase text-ink-soft">{candidate.partyName}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-extrabold tabular-nums text-brand">{formatElectionPercent(candidate.votePct)}</p>
              <p className="text-[11px] font-semibold tabular-nums text-ink-soft">
                {formatElectionCount(candidate.votes)} oy
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
