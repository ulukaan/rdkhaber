"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CITIES, CITY_COOKIE } from "@/lib/cities";
import { readConsentCookie } from "@/lib/cookie-consent";
import type { PrayerDay } from "@/lib/prayer-times";
import type { ImsakiyeDesign } from "@/lib/settings";
import { cn } from "@/lib/utils";

const GREEN = "#4da674";

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

function formatRemain(ms: number, withSeconds = true) {
  if (ms < 0) ms += 24 * 60 * 60 * 1000;
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  if (!withSeconds) return `${h}:${m}`;
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function usePrayerClock(day: PrayerDay) {
  const [remainShort, setRemainShort] = useState("00:00");
  const [active, setActive] = useState(day.slots[0]?.key ?? "");
  const [countdownLabel, setCountdownLabel] = useState("VAKTE KALAN");

  useEffect(() => {
    const tick = () => {
      const next = nextSlot(day);
      const maghrib = day.slots.find((s) => s.key === "Maghrib");
      const now = Date.now();
      const useIftar = Boolean(maghrib && parseToday(maghrib.time).getTime() > now);
      const targetSlot = useIftar ? maghrib! : next!;
      setActive(next!.key);
      setCountdownLabel(useIftar ? "İFTARA KALAN" : `${targetSlot.label.toLocaleUpperCase("tr-TR")} VAKTİNE`);
      let diff = parseToday(targetSlot.time).getTime() - now;
      if (diff <= 0) diff += 24 * 60 * 60 * 1000;
      setRemainShort(formatRemain(diff, false));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [day]);

  return { remainShort, active, countdownLabel };
}

function citySlugFromName(name: string) {
  return CITIES.find((c) => c.name === name)?.slug ?? "duzce";
}

function CityPicker({ cityName }: { cityName: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const value = citySlugFromName(cityName);

  return (
    <label className="inline-flex items-center gap-1">
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
        className="max-w-[7.5rem] cursor-pointer appearance-none truncate border-0 bg-transparent py-0 pr-4 text-sm font-semibold text-ink outline-none disabled:opacity-60"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%234b5563' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0 center",
        }}
      >
        {CITIES.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Dekoratif gül — referans tasarımdaki floral motif */
function RoseMotif({ className }: { className?: string }) {
  return (
    <svg
      className={cn("pointer-events-none h-10 w-10 shrink-0 opacity-90 sm:h-12 sm:w-12", className)}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
    >
      <circle cx="28" cy="30" r="10" fill="#e8a0b0" />
      <circle cx="36" cy="26" r="9" fill="#d4788c" />
      <circle cx="32" cy="34" r="8" fill="#c45c74" />
      <circle cx="30" cy="28" r="4" fill="#f5c4ce" />
      <path d="M22 40c-4 6-10 10-14 12 6-2 12-2 16 2" stroke="#5a9a5e" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="18" cy="46" rx="5" ry="3" fill="#6aaa6e" transform="rotate(-30 18 46)" />
      <ellipse cx="44" cy="42" rx="4" ry="2.5" fill="#6aaa6e" transform="rotate(25 44 42)" />
    </svg>
  );
}

function PrayerTimesRow({
  day,
  active,
  className,
}: {
  day: PrayerDay;
  active: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-1 items-stretch overflow-x-auto", className)}>
      {day.slots.map((slot, index) => {
        const on = slot.key === active;
        return (
          <div
            key={slot.key}
            className={cn(
              "relative flex min-w-[4.25rem] flex-1 flex-col items-center justify-center px-2 py-1 text-center sm:min-w-0 sm:px-3",
              index > 0 && "border-l border-[#e5e7eb]",
            )}
          >
            <span
              className={cn(
                "inline-flex flex-col items-center rounded-full px-2.5 py-1.5 sm:px-3",
                on && "text-white",
              )}
              style={on ? { backgroundColor: GREEN } : undefined}
            >
              <span
                className={cn(
                  "text-[10px] font-medium uppercase tracking-wide",
                  on ? "text-white/90" : "text-ink-soft",
                )}
              >
                {slot.label}
              </span>
              <span
                className={cn(
                  "text-sm font-bold tabular-nums sm:text-[15px]",
                  on ? "text-white" : "text-ink",
                )}
              >
                {slot.time}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Design1({ day }: { day: PrayerDay }) {
  const { remainShort, active, countdownLabel } = usePrayerClock(day);

  return (
    <section className="mt-4 overflow-hidden border border-border bg-white" aria-label="İmsakiye">
      <div className="flex flex-col gap-3 px-3 py-3 sm:px-4">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <RoseMotif className="hidden sm:block" />
            <CityPicker cityName={day.city} />
          </div>

          <p className="text-base font-extrabold tabular-nums tracking-tight sm:text-lg" style={{ color: GREEN }}>
            {countdownLabel} {remainShort}
          </p>

          {day.hijri ? (
            <p className="text-xs font-medium uppercase tracking-wide text-ink sm:text-sm">
              {day.hijri}
            </p>
          ) : null}

          <p className="ml-auto hidden max-w-[220px] text-right text-[11px] leading-relaxed text-ink-soft lg:block">
            Namaz vakitleri Diyanet takvimine göredir. Yerel saat dilimine göre güncellenir.
          </p>
        </div>

        <div className="relative border-t border-[#eef0f3] pt-2">
          <PrayerTimesRow day={day} active={active} />
          <RoseMotif className="absolute -bottom-1 -right-1 hidden opacity-70 sm:block" />
        </div>
      </div>
    </section>
  );
}

function Design2({ day }: { day: PrayerDay }) {
  const { remainShort, active, countdownLabel } = usePrayerClock(day);

  return (
    <section className="mt-4 overflow-hidden border border-border bg-white" aria-label="İmsakiye">
      <div className="flex flex-col gap-3 px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:gap-4">
        <div className="flex shrink-0 items-center gap-2">
          <RoseMotif />
          <CityPicker cityName={day.city} />
        </div>

        <p
          className="shrink-0 text-base font-extrabold tabular-nums tracking-tight sm:text-lg"
          style={{ color: GREEN }}
        >
          {countdownLabel} {remainShort}
        </p>

        {day.hijri ? (
          <p className="shrink-0 text-xs font-medium uppercase tracking-wide text-ink sm:text-sm">
            {day.hijri}
          </p>
        ) : null}

        <PrayerTimesRow day={day} active={active} className="lg:justify-end" />

        <RoseMotif className="ml-auto hidden lg:block" />
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
