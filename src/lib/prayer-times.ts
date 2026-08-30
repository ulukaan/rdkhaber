import { cache } from "react";
import type { CityDef } from "@/lib/cities";
import { resolveCity } from "@/lib/cities";

export const PRAYER_SLOTS = [
  { key: "Fajr", label: "İmsak" },
  { key: "Sunrise", label: "Güneş" },
  { key: "Dhuhr", label: "Öğle" },
  { key: "Asr", label: "İkindi" },
  { key: "Maghrib", label: "Akşam" },
  { key: "Isha", label: "Yatsı" },
] as const;

export type PrayerSlot = {
  key: (typeof PRAYER_SLOTS)[number]["key"];
  label: string;
  time: string;
};

export type PrayerDay = {
  city: string;
  hijri: string;
  gregorian: string;
  slots: PrayerSlot[];
};

function cleanTime(raw: string) {
  return raw.trim().slice(0, 5);
}

export function getNextPrayerSlot(day: PrayerDay, now = new Date()): PrayerSlot | null {
  if (day.slots.length === 0) return null;
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  for (const slot of day.slots) {
    const [h, m] = slot.time.split(":").map(Number);
    if (h * 60 + m > minutesNow) return slot;
  }
  return day.slots[0] ?? null;
}

export const getPrayerTimes = cache(
  async (cityInput?: CityDef | string | null): Promise<PrayerDay | null> => {
    const city = typeof cityInput === "string" || cityInput == null ? resolveCity(cityInput) : cityInput;
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city.query)}&country=Turkey&method=13`;
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      const json = (await res.json()) as {
        data?: {
          timings?: Record<string, string>;
          date?: {
            readable?: string;
            hijri?: { day?: string; month?: { en?: string }; year?: string };
          };
        };
      };
      const timings = json.data?.timings;
      if (!timings) return null;

      const slots: PrayerSlot[] = [];
      for (const slot of PRAYER_SLOTS) {
        const time = timings[slot.key];
        if (!time) continue;
        slots.push({ key: slot.key, label: slot.label, time: cleanTime(time) });
      }
      if (slots.length === 0) return null;

      const hijri = json.data?.date?.hijri;
      const hijriLabel = hijri?.day
        ? `${hijri.day} ${hijri.month?.en ?? ""} ${hijri.year ?? ""}`.trim()
        : "";

      return {
        city: city.name,
        hijri: hijriLabel,
        gregorian: json.data?.date?.readable ?? "",
        slots,
      };
    } catch {
      return null;
    }
  },
);
