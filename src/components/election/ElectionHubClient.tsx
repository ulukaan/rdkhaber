"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ElectionRaceType, ElectionStatus } from "@prisma/client";
import { ElectionKpiGrid } from "@/components/election/ElectionKpiGrid";
import {
  ElectionCandidateCards,
  ElectionResultsTable,
  type ElectionCandidateView,
} from "@/components/election/ElectionCandidateCards";
import { ElectionDistrictGrid, type ElectionDistrictView } from "@/components/election/ElectionDistrictGrid";
import { computeBoxPct, ELECTION_STATUS_LABELS, RACE_TYPE_LABELS } from "@/lib/election";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

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
  candidates: ElectionCandidateView[];
  districts: ElectionDistrictView[];
  news: Array<{
    slug: string;
    title: string;
    summary: string;
    coverImageUrl: string | null;
    publishedAt: string | null;
  }>;
};

const RACE_TABS: ElectionRaceType[] = ["MAYOR", "COUNCIL"];

export function ElectionHubClient({ election }: { election: ElectionHubPayload }) {
  const router = useRouter();
  const [raceType, setRaceType] = useState<ElectionRaceType>("MAYOR");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(election.liveRefreshSec);

  const boxPct = computeBoxPct(election.openBoxes, election.totalBoxes);
  const isLive = election.status === "LIVE";

  useEffect(() => {
    if (!isLive) return;
    const tick = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          router.refresh();
          return election.liveRefreshSec;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(tick);
  }, [election.liveRefreshSec, isLive, router]);

  const visibleCandidates = useMemo(() => {
    if (!selectedDistrict) return election.candidates;
    return election.candidates;
  }, [election.candidates, selectedDistrict]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Seçim merkezi</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{election.title}</h1>
            {election.subtitle ? <p className="mt-1 text-sm text-ink-soft">{election.subtitle}</p> : null}
          </div>
          <div className="flex flex-col items-start gap-1 text-sm text-ink-soft lg:items-end">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
                isLive ? "bg-brand text-white" : "bg-surface text-ink-soft",
              )}
            >
              {ELECTION_STATUS_LABELS[election.status]}
            </span>
            {isLive ? (
              <span>Veriler {secondsLeft} sn içinde yenilenecek</span>
            ) : null}
            {election.lastResultsAt ? (
              <span>Son güncelleme: {formatDate(new Date(election.lastResultsAt))}</span>
            ) : null}
          </div>
        </div>
        <p className="mt-4 text-xs text-ink-soft">
          Resmî sonuçlar YSK&apos;ya tabidir. Bu sayfa haber amaçlı özet sunar.
        </p>
      </header>

      <ElectionKpiGrid
        totalBoxes={election.totalBoxes}
        openBoxes={election.openBoxes}
        totalVoters={election.totalVoters}
        usedVotes={election.usedVotes}
        validVotes={election.validVotes}
      />

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {RACE_TABS.map((tab) => {
          const hasRows = election.candidates.some((item) => item.raceType === tab);
          if (!hasRows) return null;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setRaceType(tab)}
              className={cn(
                "shrink-0 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors",
                raceType === tab
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-white text-ink-soft hover:border-brand/40 hover:text-ink",
              )}
            >
              {RACE_TYPE_LABELS[tab]}
            </button>
          );
        })}
      </div>

      <ElectionCandidateCards candidates={visibleCandidates} raceType={raceType} boxPct={boxPct} />
      <ElectionResultsTable candidates={visibleCandidates} raceType={raceType} />
      <ElectionDistrictGrid
        districts={election.districts}
        selectedSlug={selectedDistrict}
        onSelect={setSelectedDistrict}
      />

      {election.news.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-ink">Seçim haberleri</h2>
            <Link href="/kategori/secim" className="text-sm font-semibold text-brand hover:underline">
              Tümü
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {election.news.map((article) => (
              <Link
                key={article.slug}
                href={`/haber/${article.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {article.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={article.coverImageUrl} alt="" className="aspect-[16/9] w-full object-cover" />
                ) : (
                  <div className="aspect-[16/9] bg-surface" />
                )}
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-bold text-ink group-hover:text-brand">{article.title}</h3>
                  <p className="mt-2 line-clamp-2 text-xs text-ink-soft">{article.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
