"use client";

import { useEffect, useState } from "react";
import type { PrayerDay } from "@/lib/prayer-times";
import type { ImsakiyeDesign } from "@/lib/settings";
import { cn } from "@/lib/utils";

function parseToday(time: string) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function nextSlot(day: PrayerDay) {
  const now = Date.now();
  for (const slot of day.slots) {
    if (parseToday(slot.time).getTime() > now) return slot;
  }
  return day.slots[0];
}

function formatRemain(ms: number) {
  if (ms < 0) ms += 24 * 60 * 60 * 1000;
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function usePrayerClock(day: PrayerDay) {
  const [remain, setRemain] = useState("00:00:00");
  const [active, setActive] = useState(day.slots[0]?.key ?? "");
  const [countdownLabel, setCountdownLabel] = useState("Vakte");

  useEffect(() => {
    const tick = () => {
      const next = nextSlot(day);
      const maghrib = day.slots.find((s) => s.key === "Maghrib");
      const now = Date.now();
      const useIftar = maghrib && parseToday(maghrib.time).getTime() > now;
      const targetSlot = useIftar ? maghrib : next;
      setActive(next.key);
      setCountdownLabel(useIftar ? "İftara kalan" : `${targetSlot.label} vaktine`);
      let diff = parseToday(targetSlot.time).getTime() - now;
      if (diff <= 0) diff += 24 * 60 * 60 * 1000;
      setRemain(formatRemain(diff));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [day]);

  return { remain, active, countdownLabel };
}

function Design1({ day }: { day: PrayerDay }) {
  const { remain, active, countdownLabel } = usePrayerClock(day);

  return (
    <section className="mt-4 border border-border bg-white" aria-label="İmsakiye">
      <div className="grid gap-4 p-4 lg:grid-cols-[180px_160px_1fr_200px] lg:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-brand">İmsakiye</p>
          <p className="text-base font-extrabold text-ink">{day.city}</p>
          {day.hijri ? <p className="mt-1 text-[11px] text-ink-soft">{day.hijri}</p> : null}
          {day.gregorian ? <p className="text-[11px] text-ink-soft">{day.gregorian}</p> : null}
        </div>

        <div className="border border-border bg-surface px-3 py-2.5 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">{countdownLabel}</p>
          <p className="text-xl font-extrabold tabular-nums text-brand">{remain}</p>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {day.slots.map((slot) => {
            const on = slot.key === active;
            return (
              <div
                key={slot.key}
                className={cn("px-2 py-2 text-center", on ? "bg-brand text-white" : "bg-surface")}
              >
                <p className={cn("text-[10px] font-bold uppercase", on ? "text-white/80" : "text-ink-soft")}>
                  {slot.label}
                </p>
                <p className={cn("text-sm font-extrabold tabular-nums", on ? "text-white" : "text-ink")}>
                  {slot.time}
                </p>
              </div>
            );
          })}
        </div>

        <p className="hidden text-[12px] leading-relaxed text-ink-soft lg:block">
          Namaz vakitleri Diyanet takvimine göredir. Yerel saat dilimine göre güncellenir.
        </p>
      </div>
    </section>
  );
}

function Design2({ day }: { day: PrayerDay }) {
  const { remain, active, countdownLabel } = usePrayerClock(day);

  return (
    <section className="mt-4 border border-border bg-white" aria-label="İmsakiye">
      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center">
        <div className="shrink-0 lg:w-44">
          <p className="text-[11px] font-bold uppercase tracking-wide text-brand">İmsakiye</p>
          <p className="text-sm font-extrabold text-ink">{day.city}</p>
          {day.hijri ? <p className="text-[11px] text-ink-soft">{day.hijri}</p> : null}
        </div>

        <div className="min-w-[140px] shrink-0 border-y border-border py-2 lg:border-x lg:border-y-0 lg:px-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">{countdownLabel}</p>
          <p className="text-lg font-extrabold tabular-nums text-brand">{remain}</p>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-3 gap-2 sm:grid-cols-6">
          {day.slots.map((slot) => {
            const on = slot.key === active;
            return (
              <div key={slot.key} className={cn("px-2 py-1.5 text-center", on && "bg-brand text-white")}>
                <p className={cn("text-[10px] font-bold uppercase", on ? "text-white/80" : "text-ink-soft")}>
                  {slot.label}
                </p>
                <p className={cn("text-sm font-extrabold tabular-nums", on ? "text-white" : "text-ink")}>
                  {slot.time}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ImsakiyeBar({
  day,
  design = "2",
}: {
  day: PrayerDay;
  design?: ImsakiyeDesign;
}) {
  if (design === "1") return <Design1 day={day} />;
  return <Design2 day={day} />;
}
