import { cache } from "react";

const API_URL =
  "https://fast.fanatik.com.tr/api/v1/soccer/widgets/data/live-match-statuses-horizontal-lite";
const LOGO_CDN = "https://fast-images.fanatik.com.tr";
const AUTH = Buffer.from(
  process.env.LIVESCORE_API_AUTH ?? "frontend:x@FJ2U7g!T4n",
).toString("base64");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const REVALIDATE = 60;

export type LiveScorePhase = "upcoming" | "live" | "finished" | "other";

export type LiveScoreLeague = {
  id: string;
  name: string;
  order: number;
};

export type LiveScoreMatch = {
  id: string;
  leagueId: string;
  leagueName: string;
  leagueAbbr: string;
  startDate: string;
  status: string;
  phase: LiveScorePhase;
  clock: string | null;
  homeName: string;
  homeShort: string;
  homeLogo: string | null;
  awayName: string;
  awayShort: string;
  awayLogo: string | null;
  homeScore: number | null;
  awayScore: number | null;
};

export type LiveScoreSnapshot = {
  leagues: LiveScoreLeague[];
  matches: LiveScoreMatch[];
};

type ApiLeague = {
  competitionId?: string;
  displayName?: string;
  name?: string;
  displayOrder?: string | number;
};

type ApiMatch = {
  sportEventId?: string;
  leagueId?: string;
  leagueName?: string;
  leagueAbbreviation?: string;
  startDate?: string;
  status?: string;
  matchStatus?: string;
  clock?: string | { matchTime?: string; stoppageTime?: string } | null;
  homeTeamName?: string;
  homeTeamNameShort?: string;
  homeTeamLogo?: string;
  awayTeamName?: string;
  awayTeamNameShort?: string;
  awayTeamLogo?: string;
  homeTeamScore?: number | null;
  awayTeamScore?: number | null;
};

function logoUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  const remote = path.startsWith("http")
    ? path
    : `${LOGO_CDN}${path.startsWith("/") ? path : `/${path}`}`;
  try {
    const host = new URL(remote).hostname;
    if (host === "fast-images.fanatik.com.tr") {
      return `/api/livescore-logo?u=${encodeURIComponent(remote)}`;
    }
  } catch {
    return remote;
  }
  return remote;
}

function phaseOf(status: string, matchStatus: string): LiveScorePhase {
  const s = `${status} ${matchStatus}`.toLowerCase();
  if (
    s.includes("live") ||
    s.includes("1st_half") ||
    s.includes("2nd_half") ||
    s.includes("halftime") ||
    s.includes("extra_time") ||
    s.includes("penalty") ||
    s.includes("inprogress") ||
    s.includes("in_progress")
  ) {
    return "live";
  }
  if (
    s.includes("ended") ||
    s.includes("closed") ||
    s.includes("finished") ||
    s.includes("aet") ||
    s.includes("ap")
  ) {
    return "finished";
  }
  if (s.includes("not_started") || s.includes("delayed") || !status) {
    return "upcoming";
  }
  return "other";
}

function clockLabel(clock: ApiMatch["clock"]): string | null {
  if (!clock) return null;
  if (typeof clock === "string") return clock.trim() || null;
  const min = clock.matchTime?.trim();
  if (!min) return null;
  const stop = clock.stoppageTime?.trim();
  return stop ? `${min}+${stop}` : min;
}

function shortName(name: string | undefined, short: string | undefined) {
  const s = (short || "").trim();
  if (s) return s.slice(0, 4).toUpperCase();
  const n = (name || "").trim();
  if (!n) return "—";
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return parts
    .slice(0, 3)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function sortMatches(a: LiveScoreMatch, b: LiveScoreMatch) {
  const rank = (p: LiveScorePhase) =>
    p === "live" ? 0 : p === "upcoming" ? 1 : p === "finished" ? 2 : 3;
  const r = rank(a.phase) - rank(b.phase);
  if (r !== 0) return r;
  return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
}

export const getLiveScores = cache(async (): Promise<LiveScoreSnapshot | null> => {
  try {
    const res = await fetch(API_URL, {
      headers: {
        Authorization: `Basic ${AUTH}`,
        Accept: "application/json",
        "User-Agent": UA,
      },
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { leagues?: ApiLeague[]; matches?: ApiMatch[] } };
    const rawLeagues = json.data?.leagues ?? [];
    const rawMatches = json.data?.matches ?? [];

    const leagues: LiveScoreLeague[] = rawLeagues
      .map((l) => ({
        id: String(l.competitionId || ""),
        name: String(l.displayName || l.name || "").trim(),
        order: Number(l.displayOrder) || 9999,
      }))
      .filter((l) => l.id && l.name)
      .sort((a, b) => a.order - b.order);

    const matches: LiveScoreMatch[] = rawMatches
      .map((m) => {
        const status = String(m.status || "");
        const matchStatus = String(m.matchStatus || "");
        const id = String(m.sportEventId || "");
        if (!id || !m.startDate) return null;
        return {
          id,
          leagueId: String(m.leagueId || ""),
          leagueName: String(m.leagueName || ""),
          leagueAbbr: String(m.leagueAbbreviation || "LIG").slice(0, 4),
          startDate: m.startDate,
          status,
          phase: phaseOf(status, matchStatus),
          clock: clockLabel(m.clock),
          homeName: String(m.homeTeamName || ""),
          homeShort: shortName(m.homeTeamName, m.homeTeamNameShort),
          homeLogo: logoUrl(m.homeTeamLogo),
          awayName: String(m.awayTeamName || ""),
          awayShort: shortName(m.awayTeamName, m.awayTeamNameShort),
          awayLogo: logoUrl(m.awayTeamLogo),
          homeScore: typeof m.homeTeamScore === "number" ? m.homeTeamScore : null,
          awayScore: typeof m.awayTeamScore === "number" ? m.awayTeamScore : null,
        } satisfies LiveScoreMatch;
      })
      .filter((m): m is LiveScoreMatch => Boolean(m))
      .sort(sortMatches);

    if (matches.length === 0 && leagues.length === 0) return null;
    return { leagues, matches };
  } catch {
    return null;
  }
});
