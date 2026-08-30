"use client";

import { useEffect, useState } from "react";
import type { PrayerDay } from "@/lib/prayer-times";
import { SidebarWidget } from "@/components/news/SidebarWidget";
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

export function SidebarPrayer({ day }: { day: PrayerDay }) {
  const [remain, setRemain] = useState("00:00:00");
  const [active, setActive] = useState(day.slots[0]?.key ?? "");
  const [label, setLabel] = useState("Vakte");

  useEffect(() => {
    const tick = () => {
      const next = nextSlot(day);
      const maghrib = day.slots.find((s) => s.key === "Maghrib");
      const now = Date.now();
      const useIftar = maghrib && parseToday(maghrib.time).getTime() > now;
      const target = useIftar ? maghrib! : next;
      setActive(next.key);
      setLabel(useIftar ? "İftara kalan" : `${target.label} vaktine`);
      let diff = parseToday(target.time).getTime() - now;
      if (diff <= 0) diff += 24 * 60 * 60 * 1000;
      setRemain(formatRemain(diff));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [day]);

  return (
    <SidebarWidget title={`İmsakiye · ${day.city}`}>
      <div className="mb-3 border border-border bg-surface px-3 py-2.5 text-center">
        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">{label}</p>
        <p className="text-xl font-extrabold tabular-nums text-brand">{remain}</p>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {day.slots.map((slot) => {
          const on = slot.key === active;
          return (
            <div
              key={slot.key}
              className={cn(
                "px-1.5 py-1.5 text-center",
                on ? "bg-brand text-white" : "bg-surface text-ink",
              )}
            >
              <p className={cn("text-[9px] font-bold uppercase", on ? "text-white/80" : "text-ink-soft")}>
                {slot.label}
              </p>
              <p className="text-[12px] font-extrabold tabular-nums">{slot.time}</p>
            </div>
          );
        })}
      </div>
    </SidebarWidget>
  );
}
