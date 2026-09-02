"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CITIES } from "@/lib/cities";
import {
  currentMonthYearInIstanbul,
  getNextPrayerSlot,
  PRAYER_SLOTS,
  type PrayerCalendarDay,
  type PrayerDay,
} from "@/lib/prayer-times";
import { cn } from "@/lib/utils";

const MONTHS_TR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

function todayDayInIstanbul() {
  return Number(
    new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" }).split("-")[2],
  );
}

export function ImsakiyePanel({
  citySlug,
  month,
  year,
  today,
  calendar,
}: {
  citySlug: string;
  month: number;
  year: number;
  today: PrayerDay | null;
  calendar: PrayerCalendarDay[];
}) {
  const router = useRouter();
  const [city, setCity] = useState(citySlug);
  const todayDay = todayDayInIstanbul();
  const current = currentMonthYearInIstanbul();
  const nextPrayer = today ? getNextPrayerSlot(today) : null;

  const monthLabel = useMemo(() => `${MONTHS_TR[month - 1]} ${year}`, [month, year]);

  const navigate = (nextCity: string, nextMonth: number, nextYear: number) => {
    const params = new URLSearchParams();
    if (nextCity !== "duzce") params.set("il", nextCity);
    if (nextMonth !== current.month || nextYear !== current.year) {
      params.set("ay", String(nextMonth));
      params.set("yil", String(nextYear));
    }
    router.replace(params.size ? `/imsakiye?${params.toString()}` : "/imsakiye", { scroll: false });
  };

  const shiftMonth = (delta: number) => {
    let nextMonth = month + delta;
    let nextYear = year;
    while (nextMonth < 1) {
      nextMonth += 12;
      nextYear -= 1;
    }
    while (nextMonth > 12) {
      nextMonth -= 12;
      nextYear += 1;
    }
    navigate(city, nextMonth, nextYear);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="flex max-w-xs flex-col gap-1 text-sm">
          <span className="font-semibold text-ink">İl</span>
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              navigate(e.target.value, month, year);
            }}
            className="min-h-[44px] rounded-xl border border-border bg-white px-3 py-2 font-medium text-ink"
          >
            {CITIES.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border bg-white text-ink transition-colors hover:border-brand/40"
            aria-label="Önceki ay"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <span className="min-w-[9rem] text-center text-sm font-bold text-ink">{monthLabel}</span>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border bg-white text-ink transition-colors hover:border-brand/40"
            aria-label="Sonraki ay"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      {today ? (
        <section className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand">Bugün</p>
              <p className="text-lg font-bold text-ink">{today.city}</p>
              {today.hijri ? <p className="text-xs text-ink-soft">{today.hijri}</p> : null}
              {nextPrayer ? (
                <p className="mt-2 text-sm text-ink-soft">
                  Sıradaki vakit: <strong className="text-ink">{nextPrayer.label}</strong>{" "}
                  <span className="tabular-nums">{nextPrayer.time}</span>
                </p>
              ) : null}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {today.slots.map((slot) => (
                <div key={slot.key} className="rounded-xl bg-surface/80 px-2 py-2 text-center">
                  <p className="text-[10px] font-bold uppercase text-ink-soft">{slot.label}</p>
                  <p className="text-sm font-extrabold tabular-nums text-ink">{slot.time}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
        <table className="min-w-[720px] w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/70 text-left">
              <th className="px-3 py-3 font-bold text-ink">Gün</th>
              {PRAYER_SLOTS.map((slot) => (
                <th key={slot.key} className="px-3 py-3 font-bold text-ink">
                  {slot.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendar.map((row) => {
              const isToday =
                row.day === todayDay && month === current.month && year === current.year;
              return (
                <tr
                  key={row.day}
                  className={cn("border-b border-border/70", isToday && "bg-brand/[0.06]")}
                >
                  <td className="px-3 py-2.5 font-semibold tabular-nums text-ink">
                    {row.day}
                    {isToday ? (
                      <span className="ml-2 rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                        Bugün
                      </span>
                    ) : null}
                  </td>
                  {PRAYER_SLOTS.map((slot) => {
                    const time = row.slots.find((item) => item.key === slot.key)?.time ?? "—";
                    return (
                      <td key={slot.key} className="px-3 py-2.5 tabular-nums text-ink-soft">
                        {time}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs leading-relaxed text-ink-soft">
        Namaz vakitleri Diyanet İşleri Başkanlığı takvimine göre hesaplanır. Ramazan imsakiyesi için
        imsak satırına bakabilirsiniz.
      </p>
    </div>
  );
}
