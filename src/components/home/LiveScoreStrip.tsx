"use client";

import { useMemo, useState } from "react";
import type { LiveScoreMatch, LiveScoreSnapshot } from "@/lib/livescore";
import { cn } from "@/lib/utils";

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function formatKickoff(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startMatch = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((startMatch - startToday) / 86_400_000);
  if (diff === 0) return "Bugün";
  if (diff === 1) return "Yarın";
  if (diff === -1) return "Dün";
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;
}

function TeamLogo({ src }: { src: string | null }) {
  const [ok, setOk] = useState(Boolean(src));
  if (!src || !ok) {
    return <span className="inline-block h-5 w-5 rounded-full bg-border" aria-hidden />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={20}
      height={20}
      className="h-5 w-5 object-contain"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setOk(false)}
    />
  );
}

function MatchCard({ match }: { match: LiveScoreMatch }) {
  const live = match.phase === "live";
  const finished = match.phase === "finished";
  const hasScore =
    match.homeScore != null && match.awayScore != null && match.phase !== "upcoming";

  return (
    <article
      className={cn(
        "relative flex h-[72px] w-[210px] shrink-0 flex-col justify-center gap-1 border bg-white px-2.5 py-1.5",
        live ? "border-brand/40 shadow-[inset_3px_0_0_0_var(--brand)]" : "border-border",
      )}
      title={`${match.homeName} – ${match.awayName}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[9px] font-bold uppercase tracking-wide text-ink-soft">
          {match.leagueAbbr}
        </span>
        {live ? (
          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wide text-brand">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" aria-hidden />
            Canlı{match.clock ? ` ${match.clock}'` : ""}
          </span>
        ) : finished ? (
          <span className="text-[9px] font-bold uppercase text-ink-soft">MS</span>
        ) : (
          <span className="text-[9px] font-bold uppercase text-emerald-700">
            {dayLabel(match.startDate)} {formatKickoff(match.startDate)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
        <div className="flex min-w-0 items-center justify-end gap-1.5">
          <span className="truncate text-right text-[11px] font-extrabold text-ink">
            {match.homeShort}
          </span>
          <TeamLogo src={match.homeLogo} />
        </div>
        <div
          className={cn(
            "min-w-[2.75rem] text-center text-[13px] font-black tabular-nums",
            live || finished ? "text-ink" : "text-ink-soft",
          )}
        >
          {hasScore ? `${match.homeScore}–${match.awayScore}` : "v"}
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <TeamLogo src={match.awayLogo} />
          <span className="truncate text-[11px] font-extrabold text-ink">{match.awayShort}</span>
        </div>
      </div>
    </article>
  );
}

export function LiveScoreStrip({ data }: { data: LiveScoreSnapshot }) {
  const [leagueId, setLeagueId] = useState("all");
  const liveCount = useMemo(
    () => data.matches.filter((m) => m.phase === "live").length,
    [data.matches],
  );

  const matches = useMemo(() => {
    if (leagueId === "all") return data.matches;
    return data.matches.filter((m) => m.leagueId === leagueId);
  }, [data.matches, leagueId]);

  const loop = useMemo(() => {
    if (matches.length === 0) return [];
    return [...matches, ...matches];
  }, [matches]);

  if (data.matches.length === 0) return null;

  return (
    <section
      className="overflow-hidden border border-border bg-white"
      aria-label="Canlı skorlar"
    >
      <div className="flex items-stretch">
        <div className="flex w-[112px] shrink-0 flex-col justify-center gap-1.5 bg-ink px-2.5 py-2 text-white sm:w-[132px] sm:px-3">
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em]">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
            Skor
          </p>
          {liveCount > 0 ? (
            <p className="text-[10px] font-bold text-white/70">
              <span className="text-brand">{liveCount}</span> canlı maç
            </p>
          ) : (
            <p className="text-[10px] font-bold text-white/55">Fikstür</p>
          )}
          <label className="relative mt-0.5 block">
            <span className="sr-only">Lig seçin</span>
            <select
              value={leagueId}
              onChange={(e) => setLeagueId(e.target.value)}
              className="w-full cursor-pointer appearance-none border border-white/20 bg-white/10 py-1 pl-1.5 pr-5 text-[10px] font-bold uppercase tracking-wide text-white outline-none"
            >
              <option value="all" className="text-ink">
                Tüm Ligler
              </option>
              {data.leagues.map((league) => (
                <option key={league.id} value={league.id} className="text-ink">
                  {league.name}
                </option>
              ))}
            </select>
            <span
              className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] text-white/70"
              aria-hidden
            >
              ▾
            </span>
          </label>
        </div>

        <div className="livescore-rail relative min-w-0 flex-1 overflow-hidden bg-[#f3f6f4]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(20,24,31,0.04) 28px, rgba(20,24,31,0.04) 29px)",
            }}
            aria-hidden
          />
          {matches.length === 0 ? (
            <p className="relative px-4 py-6 text-sm text-ink-soft">Bu ligde gösterilecek maç yok.</p>
          ) : (
            <div
              key={leagueId}
              className="ticker-track ticker-track-sport relative !gap-2 !px-2 !py-2.5"
            >
              {loop.map((match, i) => (
                <MatchCard key={`${match.id}-${i}`} match={match} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
