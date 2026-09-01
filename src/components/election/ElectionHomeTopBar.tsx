"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Radio } from "lucide-react";
import type { ElectionStatus } from "@prisma/client";
import { Container } from "@/components/ui/Container";
import { ElectionCandidatePortrait } from "@/components/election/ElectionCandidatePortrait";
import {
  ELECTION_STATUS_LABELS,
  formatElectionCount,
  formatElectionPercent,
  type ElectionHomeTopBarCandidate,
  type ElectionHomeTopBarDistrictLeader,
} from "@/lib/election";
import { cn } from "@/lib/utils";

const ROTATE_MS = 4000;

function PartyTag({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5">
      <span className="h-2 w-2 shrink-0 rounded-full ring-1 ring-black/10" style={{ backgroundColor: color }} />
      <span className="truncate text-[10px] font-bold uppercase tracking-wide text-ink-soft sm:text-[11px]">
        {name}
      </span>
    </span>
  );
}

function MayorCandidateCard({
  candidate,
  rank,
  ntvCityId,
  ntvDistrictId,
}: {
  candidate: ElectionHomeTopBarCandidate;
  rank: number;
  ntvCityId: number;
  ntvDistrictId: number;
}) {
  return (
    <div className="flex min-w-[10.5rem] flex-1 items-center gap-2.5 rounded-sm border border-brand/10 bg-white px-2 py-2 shadow-sm sm:min-w-0 sm:gap-3 sm:px-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-brand text-[11px] font-extrabold text-white">
        {rank}
      </span>
      <ElectionCandidatePortrait
        name={candidate.name}
        partyName={candidate.partyName}
        partyColor={candidate.partyColor}
        photoUrl={candidate.photoUrl}
        ntvCityId={ntvCityId}
        ntvDistrictId={ntvDistrictId}
        size="duel"
        badgeCorner="bottom-right"
      />
      <div className="min-w-0">
        <p className="truncate text-xs font-extrabold uppercase leading-tight text-ink sm:text-sm">{candidate.name}</p>
        <PartyTag name={candidate.partyName} color={candidate.partyColor} />
        <p className="mt-1 text-lg font-extrabold tabular-nums text-ink sm:text-xl">
          {formatElectionPercent(candidate.votePct)}
        </p>
        <p className="hidden text-[11px] font-semibold tabular-nums text-ink-soft md:block">
          {formatElectionCount(candidate.votes)} oy
        </p>
      </div>
    </div>
  );
}

function DistrictLeaderRotator({
  leaders,
  ntvCityId,
}: {
  leaders: ElectionHomeTopBarDistrictLeader[];
  ntvCityId: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (leaders.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % leaders.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [leaders.length]);

  if (leaders.length === 0) return null;

  const leader = leaders[index]!;

  return (
    <div className="hidden min-w-[12rem] shrink-0 rounded-sm border border-brand/10 bg-white p-2.5 shadow-sm lg:block xl:min-w-[13rem]">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">İlçede önde</p>
      <div key={leader.districtSlug} className="rates-swap-in">
        <p className="mt-0.5 truncate text-xs font-extrabold uppercase text-brand">{leader.districtName}</p>
        <div className="mt-2 flex items-center gap-2">
          <ElectionCandidatePortrait
            name={leader.name}
            partyName={leader.partyName}
            partyColor={leader.partyColor}
            ntvCityId={ntvCityId}
            size="sm"
            badgeCorner="bottom-right"
          />
          <div className="min-w-0">
            <p className="truncate text-xs font-extrabold uppercase leading-tight text-ink">{leader.name}</p>
            <PartyTag name={leader.partyName} color={leader.partyColor} />
            <p className="mt-1 text-base font-extrabold tabular-nums text-ink">
              {formatElectionPercent(leader.votePct)}
            </p>
          </div>
        </div>
      </div>
      {leaders.length > 1 ? (
        <div className="mt-2 flex gap-1">
          {leaders.map((item, dotIndex) => (
            <span
              key={item.districtSlug}
              className={cn(
                "h-1 rounded-full transition-all",
                dotIndex === index ? "w-4 bg-brand" : "w-1 bg-border",
              )}
              aria-hidden
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ElectionHomeTopBar({
  title,
  status,
  boxPct,
  candidates,
  districtLeaders,
  ntvCityId,
  ntvDistrictId,
  href = "/secim",
}: {
  title: string;
  status: ElectionStatus;
  boxPct: number;
  candidates: ElectionHomeTopBarCandidate[];
  districtLeaders: ElectionHomeTopBarDistrictLeader[];
  ntvCityId: number;
  ntvDistrictId: number;
  href?: string;
}) {
  const isLive = status === "LIVE";
  const topThree = candidates.slice(0, 3);

  return (
    <div className="border-b border-brand/15 bg-brand/[0.07] text-ink shadow-sm" aria-label="Seçim özeti">
      <div className="h-0.5 bg-brand/40" aria-hidden />
      <Container className="flex min-h-[88px] flex-col gap-2 py-2.5 sm:min-h-0 sm:flex-row sm:items-stretch sm:gap-3 sm:py-3">
        <Link
          href={href}
          className="flex shrink-0 items-center gap-3 border-border sm:w-[8.5rem] sm:flex-col sm:items-start sm:justify-center sm:border-r sm:pr-3"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand">Düzce seçim</span>
            <span className="mt-0.5 block text-xs font-extrabold uppercase leading-tight text-ink sm:text-sm">
              {title}
            </span>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase",
              isLive ? "bg-brand text-white" : "bg-white text-ink-soft ring-1 ring-brand/15",
            )}
          >
            {isLive ? <Radio className="h-3 w-3 animate-pulse" /> : null}
            {ELECTION_STATUS_LABELS[status]}
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 items-stretch gap-2 overflow-x-auto pb-0.5 sm:gap-2.5 lg:overflow-visible lg:pb-0">
          {topThree.map((candidate, index) => (
            <MayorCandidateCard
              key={`${candidate.name}-${candidate.partyName}`}
              candidate={candidate}
              rank={index + 1}
              ntvCityId={ntvCityId}
              ntvDistrictId={ntvDistrictId}
            />
          ))}
        </div>

        <DistrictLeaderRotator leaders={districtLeaders} ntvCityId={ntvCityId} />

        <Link
          href={href}
          className="flex shrink-0 items-center justify-between gap-3 border-t border-border pt-2 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0 sm:text-right"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Açılan sandık</span>
            <span className="ml-2 text-base font-extrabold tabular-nums text-ink sm:ml-0 sm:block sm:text-lg">
              {formatElectionPercent(boxPct)}
            </span>
          </div>
          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-brand hover:text-brand-dark">
            Tüm sonuçlar
            <ChevronRight className="h-4 w-4" />
          </span>
        </Link>
      </Container>
    </div>
  );
}
