"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { LEAGUE_OPTIONS, type LeagueTable } from "@/lib/league-table";
import { loadLeagueTableAction } from "@/actions/league-table";
import { cn } from "@/lib/utils";

const GREEN = "#68a26b";
const ACTIVE = "#c5e65d";
const PREVIEW = 5;

export function SidebarLeagueTable({ initial }: { initial: LeagueTable }) {
  const [table, setTable] = useState(initial);
  const [tab, setTab] = useState<"standings" | "fixtures">("standings");
  const [expanded, setExpanded] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const leagues = useMemo(() => LEAGUE_OPTIONS, []);
  const visibleRows = expanded ? table.rows : table.rows.slice(0, PREVIEW);
  const hasMore = table.rows.length > PREVIEW;

  function selectLeague(id: string) {
    if (id === table.id) return;
    setError(null);
    setExpanded(false);
    start(async () => {
      const result = await loadLeagueTableAction(id);
      if (result && "error" in result) {
        setError(result.error ?? null);
        return;
      }
      if (result?.table) setTable(result.table);
    });
  }

  return (
    <section aria-label="Lig tablosu">
      <div className="overflow-hidden" style={{ backgroundColor: GREEN }}>
        <div className="flex items-center gap-4 px-3 py-2.5 text-xs font-extrabold uppercase tracking-wide">
          <button
            type="button"
            onClick={() => setTab("standings")}
            className={cn(tab === "standings" ? "" : "text-white/85")}
            style={tab === "standings" ? { color: ACTIVE } : undefined}
          >
            Puan Durumu
          </button>
          <button
            type="button"
            onClick={() => setTab("fixtures")}
            className={cn(tab === "fixtures" ? "" : "text-white/85")}
            style={tab === "fixtures" ? { color: ACTIVE } : undefined}
          >
            Fikstür
          </button>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto bg-white px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {leagues.map((league) => {
            const on = league.id === table.id;
            return (
              <button
                key={league.id}
                type="button"
                onClick={() => selectLeague(league.id)}
                disabled={pending}
                className={cn(
                  "shrink-0 border-b-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wide transition-colors",
                  on ? "text-ink" : "border-transparent text-ink-soft hover:text-ink",
                )}
                style={on ? { borderBottomColor: GREEN } : undefined}
                title={league.name}
              >
                {league.shortName}
              </button>
            );
          })}
        </div>

        <div className="mx-0 border-x-0 bg-white" style={{ borderColor: GREEN }}>
          {tab === "fixtures" ? (
            <div className="space-y-2 px-3 py-4 text-center text-sm text-ink-soft">
              <p>Fikstür canlı skor şeridinde gösterilir.</p>
              <Link href="/" className="font-semibold text-brand hover:underline">
                Canlı skorlara bak →
              </Link>
            </div>
          ) : error ? (
            <p className="px-3 py-4 text-center text-sm text-ink-soft">{error}</p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] font-extrabold uppercase tracking-wide text-ink">
                    <th className="px-3 py-2 font-extrabold">Takım</th>
                    <th className="w-10 px-2 py-2 text-right font-extrabold">O</th>
                    <th className="w-10 px-3 py-2 text-right font-extrabold">P</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, index) => (
                    <tr
                      key={`${row.rank}-${row.team}`}
                      className={cn(index % 2 === 1 ? "bg-[#f3f4f6]" : "bg-white")}
                    >
                      <td className="px-3 py-2">
                        <span className="mr-1.5 inline-block w-4 text-[11px] tabular-nums text-ink-soft">
                          {row.rank}
                        </span>
                        <span className="font-semibold text-ink">{row.team}</span>
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums text-ink">{row.played}</td>
                      <td className="px-3 py-2 text-right font-bold tabular-nums text-ink">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {hasMore ? (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="flex w-full items-center justify-center gap-1 border-t border-border px-3 py-2.5 text-xs font-extrabold uppercase tracking-wide text-ink hover:bg-[#f3f4f6]"
                >
                  {expanded ? (
                    <>
                      Daha az
                      <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                    </>
                  ) : (
                    <>
                      Daha fazlası
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                    </>
                  )}
                </button>
              ) : null}
            </>
          )}
        </div>

        <p className="px-3 py-2.5 text-center text-sm text-white/95">Detaylar için tıklayın.</p>
      </div>
    </section>
  );
}
