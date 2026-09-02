"use server";

import { getLeagueTable, LEAGUE_OPTIONS } from "@/lib/league-table";

export async function loadLeagueTableAction(leagueId: string) {
  if (!LEAGUE_OPTIONS.some((l) => l.id === leagueId)) {
    return { error: "Geçersiz lig." };
  }
  const table = await getLeagueTable(leagueId);
  if (!table) return { error: "Puan durumu alınamadı." };
  return { table };
}
