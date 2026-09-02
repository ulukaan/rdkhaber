"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Hourglass, MoreHorizontal, RefreshCw } from "lucide-react";
import { CITIES, CITY_COOKIE } from "@/lib/cities";
import { readConsentCookie } from "@/lib/cookie-consent";
import type { PrayerDay } from "@/lib/prayer-times";
import { cn } from "@/lib/utils";

const GREEN = "#5f9e64";
const GREEN_DARK = "#3f7a45";
const GREEN_ACTIVE = "#6aad6f";

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
  return `${h}:${m}`;
}

function citySlugFromName(name: string) {
  return CITIES.find((c) => c.name === name)?.slug ?? "duzce";
}

export function SidebarPrayerTimes({ day }: { day: PrayerDay }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [remain, setRemain] = useState("00:00");
  const [active, setActive] = useState(day.slots[0]?.key ?? "");
  const value = citySlugFromName(day.city);

  useEffect(() => {
    const tick = () => {
      const next = nextSlot(day);
      setActive(next!.key);
      let diff = parseToday(next!.time).getTime() - Date.now();
      if (diff <= 0) diff += 24 * 60 * 60 * 1000;
      setRemain(formatRemain(diff));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [day]);

  const activeIndex = day.slots.findIndex((s) => s.key === active);

  return (
    <section aria-label="Namaz vakitleri">
      <div className="overflow-hidden" style={{ backgroundColor: GREEN }}>
        <div className="relative px-3 pb-3 pt-3 text-white">
          <div className="mb-3 flex items-start justify-between gap-2">
            <label className="inline-flex items-center border border-white/70 bg-white/10 px-2 py-1">
              <span className="sr-only">İl seçin</span>
              <select
                value={value}
                disabled={pending}
                aria-label="İl seçimi"
                onChange={(e) => {
                  const slug = e.target.value;
                  const consent = readConsentCookie();
                  const persist = consent?.preferences === true;
                  document.cookie = persist
                    ? `${CITY_COOKIE}=${encodeURIComponent(slug)};path=/;max-age=31536000;samesite=lax`
                    : `${CITY_COOKIE}=${encodeURIComponent(slug)};path=/;samesite=lax`;
                  start(() => router.refresh());
                }}
                className="cursor-pointer appearance-none bg-transparent pr-4 text-sm font-semibold text-white outline-none disabled:opacity-60"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%23ffffff' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0 center",
                }}
              >
                {CITIES.map((c) => (
                  <option key={c.slug} value={c.slug} className="text-ink">
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <MoreHorizontal className="h-4 w-4 opacity-80" aria-hidden />
          </div>

          <div className="relative z-[1]">
            <p className="text-xs font-medium text-white/90">Sonraki vakte kalan</p>
            <p className="mt-1 text-4xl font-extrabold tabular-nums tracking-tight">{remain}</p>
          </div>

          <svg
            className="pointer-events-none absolute bottom-0 right-2 h-20 w-24 opacity-30"
            viewBox="0 0 96 80"
            fill="none"
            aria-hidden
          >
            <path
              d="M12 72V36l12-8 12 8v36M36 72V28l16-10 16 10v44M68 72V40l10-6 10 6v32"
              stroke="white"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path d="M8 72h80" stroke="white" strokeWidth="3" />
          </svg>
        </div>

        <ul className="space-y-1.5 px-2.5 pb-2.5">
          {day.slots.map((slot, index) => {
            const on = slot.key === active;
            const past = activeIndex > index;
            return (
              <li
                key={slot.key}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2.5 text-sm",
                  on ? "text-white" : "bg-white text-ink",
                )}
                style={on ? { backgroundColor: GREEN_ACTIVE } : undefined}
              >
                <span className="w-[4.5rem] font-bold uppercase tracking-wide">{slot.label}</span>
                <span className="flex-1 text-center font-extrabold tabular-nums">{slot.time}</span>
                <span className="flex w-6 justify-end" aria-hidden>
                  {past ? (
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: GREEN_DARK }}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  ) : on ? (
                    <RefreshCw className="h-4 w-4 text-white" />
                  ) : (
                    <Hourglass className="h-4 w-4 text-ink-soft" />
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
