"use client";

import { useMemo, useState } from "react";
import type { ElectionRaceType } from "@prisma/client";
import { ChevronDown } from "lucide-react";
import { computeVoteGap } from "@/lib/election";
import {
  DEFAULT_METRO_SLOT_KEYS,
  getNtvCityEntry,
  NTV_CITY_OPTIONS,
} from "@/lib/election-national-data";
import { ElectionCityDuelBox } from "@/components/election/ElectionCityDuelBox";
import type { ElectionCandidateView } from "@/components/election/ElectionCandidateCards";

const CITY_OPTIONS = NTV_CITY_OPTIONS.map((c) => ({ key: c.key, label: c.label }));

export function ElectionFeaturedCitiesGrid({
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
  const [metroSlots, setMetroSlots] = useState<string[]>([...DEFAULT_METRO_SLOT_KEYS]);
  const [extraCityKey, setExtraCityKey] = useState("");

  const mayorTop = candidates
    .filter((c) => c.raceType === raceType)
    .sort((a, b) => b.votes - a.votes);
  const first = mayorTop[0];
  const second = mayorTop[1];
  const duzceGap = first && second ? computeVoteGap([first, second]) : 0;

  const usedKeys = useMemo(
    () => new Set([...metroSlots, extraCityKey].filter(Boolean)),
    [metroSlots, extraCityKey],
  );

  function updateMetroSlot(index: number, key: string) {
    setMetroSlots((prev) => prev.map((k, i) => (i === index ? key : k)));
  }

  function optionsForSlot(currentKey: string) {
    return CITY_OPTIONS.filter((opt) => opt.key === currentKey || !metroSlots.includes(opt.key));
  }

  if (raceType !== "MAYOR") {
    if (!first) return null;
    return (
      <ElectionCityDuelBox
        cityName="Düzce"
        active
        boxPct={boxPct}
        voteGap={duzceGap}
        ntvCityId={ntvCityId}
        ntvDistrictId={ntvDistrictId}
        first={{
          name: first.name,
          partyName: first.partyName,
          partyColor: first.partyColor,
          votePct: first.votePct,
          photoUrl: first.photoUrl,
        }}
        second={
          second
            ? {
                name: second.name,
                partyName: second.partyName,
                partyColor: second.partyColor,
                votePct: second.votePct,
                photoUrl: second.photoUrl,
              }
            : undefined
        }
      />
    );
  }

  const extraCity = extraCityKey ? getNtvCityEntry(extraCityKey) : null;

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {first ? (
        <ElectionCityDuelBox
          cityName="Düzce"
          active
          boxPct={boxPct}
          voteGap={duzceGap}
          ntvCityId={ntvCityId}
          ntvDistrictId={ntvDistrictId}
          first={{
            name: first.name,
            partyName: first.partyName,
            partyColor: first.partyColor,
            votePct: first.votePct,
            photoUrl: first.photoUrl,
          }}
          second={
            second
              ? {
                  name: second.name,
                  partyName: second.partyName,
                  partyColor: second.partyColor,
                  votePct: second.votePct,
                  photoUrl: second.photoUrl,
                }
              : undefined
          }
        />
      ) : null}

      {metroSlots.map((slotKey, index) => {
        const city = getNtvCityEntry(slotKey);
        if (!city) return null;
        return (
          <ElectionCityDuelBox
            key={`metro-${index}`}
            cityName={city.cityName}
            boxPct={city.boxPct}
            voteGap={city.voteGap}
            first={city.first}
            second={city.second}
            ntvCityId={city.ntvCityId}
            citySelector={{
              value: slotKey,
              options: optionsForSlot(slotKey),
              onChange: (key) => updateMetroSlot(index, key),
            }}
          />
        );
      })}

      {extraCity ? (
        <ElectionCityDuelBox
          cityName={extraCity.cityName}
          boxPct={extraCity.boxPct}
          voteGap={extraCity.voteGap}
          first={extraCity.first}
          second={extraCity.second}
          ntvCityId={extraCity.ntvCityId}
          citySelector={{
            value: extraCityKey,
            options: CITY_OPTIONS.filter((opt) => !usedKeys.has(opt.key) || opt.key === extraCityKey),
            onChange: setExtraCityKey,
          }}
        />
      ) : (
        <div className="flex h-full min-h-[168px] flex-col border border-border bg-white p-2.5 sm:min-h-[176px] sm:p-3">
          <div className="border-b border-border pb-1.5">
            <label htmlFor="city-select-extra" className="text-xs font-extrabold uppercase tracking-wide text-ink">
              Şehir seçiniz
            </label>
          </div>
          <div className="relative mt-3 flex-1">
            <select
              id="city-select-extra"
              className="w-full appearance-none border border-border bg-surface px-3 py-2 pr-9 text-xs font-bold uppercase text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              value=""
              onChange={(e) => {
                if (e.target.value) setExtraCityKey(e.target.value);
              }}
            >
              <option value="" disabled>
                Şehir seçiniz
              </option>
              {CITY_OPTIONS.filter((opt) => !usedKeys.has(opt.key)).map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          </div>
        </div>
      )}
    </div>
  );
}
