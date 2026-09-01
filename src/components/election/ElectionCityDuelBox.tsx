import { ChevronDown } from "lucide-react";
import { formatElectionCount, formatElectionPercent } from "@/lib/election";
import { resolvePartyColor } from "@/lib/election-candidate-photo";
import { ElectionCandidatePortrait } from "@/components/election/ElectionCandidatePortrait";
import { cn } from "@/lib/utils";

export type CityDuelCandidate = {
  name: string;
  partyName: string;
  partyColor: string;
  votePct: number;
  photoUrl?: string | null;
};

type CityOption = { key: string; label: string };

function DuelCandidateCell({
  candidate,
  ntvCityId,
  ntvDistrictId,
  align,
}: {
  candidate: CityDuelCandidate;
  ntvCityId?: number | null;
  ntvDistrictId?: number | null;
  align: "left" | "right" | "center";
}) {
  const partyColor = resolvePartyColor(candidate.partyName, candidate.partyColor);
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col",
        align === "right"
          ? "items-end text-right"
          : align === "center"
            ? "items-center text-center"
            : "items-start text-left",
      )}
    >
      <ElectionCandidatePortrait
        name={candidate.name}
        partyName={candidate.partyName}
        partyColor={partyColor}
        photoUrl={candidate.photoUrl}
        ntvCityId={ntvCityId}
        ntvDistrictId={ntvDistrictId}
        size="duel"
        badgeCorner={align === "right" ? "bottom-left" : "bottom-right"}
      />
      <p className="mt-1.5 line-clamp-2 text-[10px] font-extrabold uppercase leading-tight text-ink">{candidate.name}</p>
      <p className="mt-0.5 text-lg font-extrabold tabular-nums sm:text-xl" style={{ color: partyColor }}>
        {formatElectionPercent(candidate.votePct)}
      </p>
    </div>
  );
}

export function ElectionCityDuelBox({
  cityName,
  first,
  second,
  voteGap,
  boxPct,
  active = false,
  ntvCityId,
  ntvDistrictId,
  citySelector,
}: {
  cityName: string;
  first: CityDuelCandidate;
  second?: CityDuelCandidate;
  voteGap: number;
  boxPct: number;
  active?: boolean;
  ntvCityId?: number | null;
  ntvDistrictId?: number | null;
  citySelector?: {
    value: string;
    options: CityOption[];
    onChange: (key: string) => void;
    placeholder?: string;
  };
}) {
  const totalPct = first.votePct + (second?.votePct ?? 0);
  const firstBar = totalPct > 0 ? (first.votePct / totalPct) * 100 : 50;
  const secondBar = totalPct > 0 ? ((second?.votePct ?? 0) / totalPct) * 100 : 50;

  const firstColor = resolvePartyColor(first.partyName, first.partyColor);
  const secondColor = second ? resolvePartyColor(second.partyName, second.partyColor) : undefined;

  return (
    <div
      className={`flex h-full min-h-[220px] flex-col border bg-surface p-2.5 transition-shadow sm:min-h-[240px] sm:p-3 ${
        active ? "border-brand ring-1 ring-brand/20" : "border-border hover:shadow-sm"
      }`}
    >
      <div className="border-b border-border pb-1.5">
        {citySelector ? (
          <div className="relative">
            <select
              value={citySelector.value}
              onChange={(e) => citySelector.onChange(e.target.value)}
              className="w-full appearance-none bg-transparent py-0.5 pr-7 text-xs font-extrabold uppercase tracking-wide text-ink focus:outline-none sm:text-sm"
              aria-label="İl seçiniz"
            >
              {citySelector.placeholder ? (
                <option value="" disabled>
                  {citySelector.placeholder}
                </option>
              ) : null}
              {citySelector.options.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          </div>
        ) : (
          <h3 className="text-center text-xs font-extrabold uppercase tracking-wide text-ink sm:text-sm">{cityName}</h3>
        )}
      </div>

      {second ? (
        <>
          <div className="grid flex-1 grid-cols-[1fr_auto_1fr] items-end gap-1 py-2">
            <DuelCandidateCell
              candidate={first}
              ntvCityId={ntvCityId}
              ntvDistrictId={ntvDistrictId}
              align="left"
            />
            <div className="px-1 pb-1 text-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-brand">Oy farkı</p>
              <p className="text-base font-extrabold tabular-nums text-brand sm:text-lg">
                +{formatElectionCount(voteGap)}
              </p>
            </div>
            <DuelCandidateCell
              candidate={second}
              ntvCityId={ntvCityId}
              ntvDistrictId={ntvDistrictId}
              align="right"
            />
          </div>

          <div className="mt-1 flex h-2 overflow-hidden">
            <div className="h-full transition-all" style={{ width: `${firstBar}%`, backgroundColor: firstColor }} />
            <div
              className="h-full transition-all"
              style={{ width: `${secondBar}%`, backgroundColor: secondColor }}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center py-2 text-center">
          <DuelCandidateCell
            candidate={first}
            ntvCityId={ntvCityId}
            ntvDistrictId={ntvDistrictId}
            align="center"
          />
        </div>
      )}

      <div className="mt-2 border-t border-border pt-1.5">
        <p className="text-center text-[9px] font-semibold uppercase tracking-wide text-ink-soft">
          Açılan sandık: {formatElectionPercent(boxPct)}
        </p>
      </div>
    </div>
  );
}
