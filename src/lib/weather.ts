import { cache } from "react";
import type { CityDef } from "@/lib/cities";
import { resolveCity } from "@/lib/cities";

export type WeatherSnapshot = {
  city: string;
  temperature: number;
  code: number;
  label: string;
};

function labelForCode(code: number): string {
  if (code === 0) return "Açık";
  if (code === 1 || code === 2) return "Az bulutlu";
  if (code === 3) return "Bulutlu";
  if (code === 45 || code === 48) return "Sisli";
  if (code >= 51 && code <= 67) return "Yağmurlu";
  if (code >= 71 && code <= 77) return "Karlı";
  if (code >= 80 && code <= 82) return "Sağanak";
  if (code >= 85 && code <= 86) return "Kar yağışlı";
  if (code >= 95) return "Fırtınalı";
  return "Değişken";
}

export const getCityWeather = cache(async (cityInput?: CityDef | string | null): Promise<WeatherSnapshot | null> => {
  const city = typeof cityInput === "string" || cityInput == null ? resolveCity(cityInput) : cityInput;
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
      `&current=temperature_2m,weather_code&timezone=Europe%2FIstanbul`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };
    const temp = json.current?.temperature_2m;
    const code = json.current?.weather_code;
    if (typeof temp !== "number" || typeof code !== "number") return null;
    return {
      city: city.name,
      temperature: Math.round(temp),
      code,
      label: labelForCode(code),
    };
  } catch {
    return null;
  }
});

/** @deprecated use getCityWeather */
export function getDuzceWeather() {
  return getCityWeather("duzce");
}
