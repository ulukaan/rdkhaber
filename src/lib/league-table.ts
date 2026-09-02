import { cache } from "react";

export type LeagueStandingRow = {
  rank: number;
  team: string;
  played: number;
  points: number;
};

export type LeagueTable = {
  id: string;
  name: string;
  shortName: string;
  rows: LeagueStandingRow[];
};

const LEAGUES = [
  { id: "tur.1", name: "Trendyol Süper Lig", shortName: "Süper Lig" },
  { id: "tur.2", name: "Trendyol 1. Lig", shortName: "1. Lig" },
  { id: "eng.1", name: "Premier League", shortName: "PL" },
  { id: "esp.1", name: "LALIGA EA Sports", shortName: "LaLiga" },
  { id: "ger.1", name: "Bundesliga", shortName: "BL" },
] as const;

export const LEAGUE_OPTIONS = LEAGUES.map(({ id, name, shortName }) => ({ id, name, shortName }));

function statValue(
  stats: Array<{ name?: string; type?: string; value?: number }>,
  names: string[],
) {
  for (const name of names) {
    const hit = stats.find(
      (s) => s.name?.toLowerCase() === name || s.type?.toLowerCase() === name,
    );
    if (typeof hit?.value === "number") return hit.value;
  }
  return 0;
}

export const getLeagueTable = cache(async (leagueId = "tur.1"): Promise<LeagueTable | null> => {
  const meta = LEAGUES.find((l) => l.id === leagueId) ?? LEAGUES[0]!;
  try {
    const res = await fetch(`https://site.api.espn.com/apis/v2/sports/soccer/${meta.id}/standings`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      children?: Array<{
        standings?: {
          entries?: Array<{
            team?: { displayName?: string; shortDisplayName?: string };
            stats?: Array<{ name?: string; type?: string; value?: number }>;
          }>;
        };
      }>;
    };
    const entries = json.children?.[0]?.standings?.entries ?? [];
    const rows: LeagueStandingRow[] = entries.map((entry, index) => {
      const stats = entry.stats ?? [];
      return {
        rank: statValue(stats, ["rank"]) || index + 1,
        team: entry.team?.shortDisplayName || entry.team?.displayName || "—",
        played: Math.round(statValue(stats, ["gamesplayed"])),
        points: Math.round(statValue(stats, ["points"])),
      };
    });
    if (rows.length === 0) return null;
    return { id: meta.id, name: meta.name, shortName: meta.shortName, rows };
  } catch {
    return null;
  }
});
