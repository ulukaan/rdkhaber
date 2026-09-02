"use client";

import { useMemo, useState } from "react";
import { CalendarDays, MapPin, Navigation } from "lucide-react";
import {
  buildObituaryDirectionsUrl,
  buildObituaryMapUrl,
  filterObituariesByBurialDate,
  formatTrDate,
  type ObituaryEntry,
} from "@/lib/obituaries";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function ObituaryList({
  maxDate,
  initialSelectedDate,
  entries,
}: {
  maxDate: string;
  initialSelectedDate: string;
  entries: ObituaryEntry[];
}) {
  const [date, setDate] = useState(initialSelectedDate);
  const displayDate = useMemo(() => formatTrDate(date), [date]);
  const visibleEntries = useMemo(
    () => filterObituariesByBurialDate(entries, date),
    [entries, date],
  );

  return (
    <div className="flex flex-col gap-5">
      <label className="flex max-w-sm flex-col gap-1 text-sm">
        <span className="font-semibold text-ink">Defin tarihi</span>
        <span className="relative">
          <CalendarDays
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
            aria-hidden
          />
          <input
            type="date"
            value={date}
            max={maxDate}
            onChange={(e) => setDate(e.target.value)}
            className="min-h-[44px] w-full rounded-xl border border-border bg-white py-2 pl-10 pr-3 font-medium text-ink"
          />
        </span>
      </label>

      {visibleEntries.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface/60 px-4 py-10 text-center">
          <p className="font-semibold text-ink">{displayDate} için kayıt bulunamadı.</p>
          <p className="mt-2 text-sm text-ink-soft">
            Liste günlük olarak güncellenir. Farklı bir defin tarihi seçebilirsiniz.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {visibleEntries.map((entry) => (
            <ObituaryCard key={`${entry.fullName}-${entry.burialDate}-${entry.address ?? ""}`} entry={entry} />
          ))}
        </ul>
      )}

      <p className="text-xs leading-relaxed text-ink-soft">
        Cenaze programı değişebilir. Gitmeden önce yakınları veya cami cemaati ile teyit etmenizi öneririz.
      </p>
    </div>
  );
}

function ObituaryCard({ entry }: { entry: ObituaryEntry }) {
  const address = entry.address?.trim();
  const rows = [
    entry.fatherName ? { label: "Baba adı", value: entry.fatherName } : null,
    entry.motherName ? { label: "Anne adı", value: entry.motherName } : null,
    entry.deathDate ? { label: "Vefat tarihi", value: entry.deathDate } : null,
    entry.burialDate ? { label: "Defin tarihi", value: entry.burialDate } : null,
    entry.cemetery ? { label: "Mezarlık", value: entry.cemetery } : null,
  ].filter((row): row is { label: string; value: string } => Boolean(row));

  return (
    <li className="flex flex-col rounded-2xl border border-border bg-white shadow-sm">
      <div className="border-b border-border px-4 py-4">
        <h2 className="text-lg font-bold text-ink">{entry.fullName}</h2>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-1 text-sm sm:grid-cols-[7.5rem_1fr]">
            <span className="font-semibold text-ink-soft">{row.label}</span>
            <span className="text-ink">{row.value}</span>
          </div>
        ))}
        {entry.announcement ? (
          <div className="rounded-xl bg-surface/70 px-3 py-3 text-sm leading-relaxed text-ink">
            {entry.announcement}
          </div>
        ) : null}
        {address ? (
          <p className="flex items-start gap-2 text-sm text-ink-soft">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {address}
          </p>
        ) : null}
      </div>
      {address ? (
        <div className={cn("flex flex-wrap gap-2 border-t border-border px-4 py-3")}>
          <Button href={buildObituaryMapUrl(address)} variant="outline" size="sm">
            Haritada aç
          </Button>
          <Button href={buildObituaryDirectionsUrl(address)} variant="outline" size="sm">
            <Navigation className="h-4 w-4" aria-hidden />
            Yol tarifi
          </Button>
        </div>
      ) : null}
    </li>
  );
}
