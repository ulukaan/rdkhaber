"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ElectionRaceType, ElectionStatus } from "@prisma/client";
import { ElectionKpiGrid } from "@/components/election/ElectionKpiGrid";
import { ElectionResultsTable, type ElectionCandidateView } from "@/components/election/ElectionCandidateCards";
import { type ElectionDistrictView } from "@/components/election/ElectionDistrictGrid";
import { ElectionSectionBar } from "@/components/election/ElectionSectionBar";
import { ElectionTopThreeCards } from "@/components/election/ElectionTopThreeCards";
import { ElectionFeaturedCitiesGrid } from "@/components/election/ElectionFeaturedCitiesGrid";
import {
  ElectionDistrictLeaderTable,
  ElectionDistrictMapPanel,
} from "@/components/election/ElectionDistrictMapPanel";
import { computeBoxPct, formatElectionPercent, RACE_TYPE_LABELS } from "@/lib/election";
import { ElectionCouncilSeatsPanel } from "@/components/election/ElectionCouncilSeatsPanel";
import type { CouncilSeatView } from "@/lib/election-engine";
import { cn } from "@/lib/utils";

export type ElectionHubPayload = {
  slug: string;
  title: string;
  subtitle: string | null;
  status: ElectionStatus;
  liveRefreshSec: number;
  lastResultsAt: string | null;
  totalBoxes: number;
  openBoxes: number;
  totalVoters: number;
  usedVotes: number;
  validVotes: number;
  ntvCityId: number | null;
  ntvDistrictId: number | null;
  candidates: ElectionCandidateView[];
  districts: ElectionDistrictView[];
  news: Array<{
    slug: string;
    title: string;
    summary: string;
    coverImageUrl: string | null;
    publishedAt: string | null;
  }>;
  councilSeats?: CouncilSeatView[];
};

const RACE_TABS: ElectionRaceType[] = ["MAYOR", "COUNCIL"];

export function ElectionHubClient({
  election,
  selectedDistrict: selectedDistrictProp,
  onDistrictSelect,
  districtSectionRef: districtSectionRefProp,
}: {
  election: ElectionHubPayload;
  selectedDistrict?: string | null;
  onDistrictSelect?: (slug: string) => void;
  districtSectionRef?: React.RefObject<HTMLElement | null>;
}) {
  const [selectedDistrictLocal, setSelectedDistrictLocal] = useState<string | null>(null);
  const districtSectionRefLocal = useRef<HTMLElement>(null);

  const selectedDistrict = selectedDistrictProp ?? selectedDistrictLocal;
  const districtSectionRef = districtSectionRefProp ?? districtSectionRefLocal;

  function handleDistrictSelect(slug: string) {
    if (onDistrictSelect) {
      onDistrictSelect(slug);
      return;
    }
    setSelectedDistrictLocal(slug);
    districtSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const [raceType, setRaceType] = useState<ElectionRaceType>("MAYOR");

  const boxPct = computeBoxPct(election.openBoxes, election.totalBoxes);

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="overflow-hidden border border-border bg-surface px-4 py-6 sm:px-6">
        <ElectionKpiGrid
          totalBoxes={election.totalBoxes}
          openBoxes={election.openBoxes}
          totalVoters={election.totalVoters}
          usedVotes={election.usedVotes}
          validVotes={election.validVotes}
          variant="ntv"
        />
      </section>

      <div className="flex gap-0 overflow-hidden border border-b-0 border-border">
        {RACE_TABS.map((tab) => {
          const hasRows = election.candidates.some((item) => item.raceType === tab);
          if (!hasRows) return null;
          const active = raceType === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setRaceType(tab)}
              className={cn(
                "flex-1 px-4 py-3 text-center text-xs font-extrabold uppercase tracking-wide transition-colors sm:text-sm",
                active
                  ? "bg-brand-dark text-white"
                  : "border-r border-border bg-white text-ink-soft hover:bg-surface/60 last:border-r-0",
              )}
            >
              {RACE_TYPE_LABELS[tab]}
            </button>
          );
        })}
      </div>

      <section className="overflow-hidden border border-t-0 border-border bg-white shadow-sm">
        <ElectionSectionBar title="Seçim sonuçları" subtitle="Büyükşehirler ve Düzce özeti" />
        <div className="border-t border-border p-2.5 sm:p-3">
          <ElectionFeaturedCitiesGrid
            candidates={election.candidates}
            raceType={raceType}
            boxPct={boxPct}
            ntvCityId={election.ntvCityId}
            ntvDistrictId={election.ntvDistrictId}
          />
        </div>
      </section>

      <section className="overflow-hidden border border-border bg-white shadow-sm">
        <ElectionSectionBar
          title="Düzce belediyesi"
          trailing={`Açılan sandık: ${formatElectionPercent(boxPct)}`}
        />
        <ElectionTopThreeCards
          candidates={election.candidates}
          raceType={raceType}
          boxPct={boxPct}
          ntvCityId={election.ntvCityId}
          ntvDistrictId={election.ntvDistrictId}
        />
      </section>

      {raceType === "MAYOR" && election.districts.length > 0 ? (
        <section className="overflow-hidden border border-border bg-white shadow-sm">
          <ElectionSectionBar title="Yerel seçim haritası" subtitle="Düzce ilçeleri" />
          <ElectionDistrictMapPanel districts={election.districts} selectedSlug={selectedDistrict} />
        </section>
      ) : null}

      <section ref={districtSectionRef} className="overflow-hidden border border-border bg-white shadow-sm">
        <ElectionSectionBar title="İl ve ilçelere göre yerel seçim sonuçları" subtitle="Düzce" />
        <div className="border-b border-border bg-surface px-4 py-2 sm:px-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Hangi ilçede kim önde?</p>
        </div>
        <ElectionDistrictLeaderTable districts={election.districts} />
      </section>

      <section className="overflow-hidden border border-border bg-white shadow-sm">
        <ElectionSectionBar title="Düzce belediyesi" subtitle={RACE_TYPE_LABELS[raceType]} />
        <ElectionResultsTable candidates={election.candidates} raceType={raceType} bare />
      </section>

      {raceType === "COUNCIL" && election.councilSeats && election.councilSeats.length > 0 ? (
        <ElectionCouncilSeatsPanel seats={election.councilSeats} />
      ) : null}

      {election.news.length > 0 ? (
        <section className="overflow-hidden border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 bg-brand-dark px-4 py-3 text-white sm:px-5">
            <h2 className="text-sm font-extrabold uppercase tracking-wide sm:text-base">Seçim haberleri</h2>
            <Link href="/kategori/secim" className="text-xs font-semibold text-white/70 hover:text-white">
              Tümü →
            </Link>
          </div>
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
            {election.news.map((article) => (
              <Link
                key={article.slug}
                href={`/haber/${article.slug}`}
                className="group border-b border-r border-border transition-colors hover:bg-surface/30 last:border-r-0 sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0"
              >
                {article.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.coverImageUrl} alt="" className="aspect-[16/9] w-full object-cover" />
                ) : (
                  <div className="aspect-[16/9] bg-gradient-to-br from-surface to-border" />
                )}
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-bold text-ink group-hover:text-brand">{article.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <p className="text-center text-[11px] text-ink-soft">
        Resmî sonuçlar YSK&apos;ya tabidir. Bu sayfa haber amaçlı özet sunar.
      </p>

      <div className="flex justify-center pb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-border bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Ana sayfaya dön
        </Link>
      </div>
    </div>
  );
}
