"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  MoreHorizontal,
  Sun,
} from "lucide-react";
import { CITIES, CITY_COOKIE } from "@/lib/cities";
import { readConsentCookie } from "@/lib/cookie-consent";
import type { WeatherSnapshot } from "@/lib/weather";
import { cn } from "@/lib/utils";

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  const cls = cn("h-14 w-14", className);
  if (code === 0 || code === 1) return <Sun className={cls} aria-hidden />;
  if (code === 45 || code === 48) return <CloudFog className={cls} aria-hidden />;
  if (code >= 71 && code <= 77) return <CloudSnow className={cls} aria-hidden />;
  if (code >= 95) return <CloudLightning className={cls} aria-hidden />;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return <CloudRain className={cls} aria-hidden />;
  }
  return <Cloud className={cls} aria-hidden />;
}

function citySlugFromName(name: string) {
  return CITIES.find((c) => c.name === name)?.slug ?? "duzce";
}

export function SidebarWeather({ weather }: { weather: WeatherSnapshot }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const value = citySlugFromName(weather.city);

  return (
    <section aria-label="Hava durumu">
      <div
        className="overflow-hidden text-white"
        style={{
          background: "linear-gradient(90deg, #1e6bb8 0%, #2a9bb5 55%, #2db5a8 100%)",
        }}
      >
        <div className="flex items-center gap-2 px-3 pt-3">
          <h2 className="shrink-0 text-sm font-bold">Hava Durumu</h2>
          <span className="h-px min-w-0 flex-1 bg-white/35" aria-hidden />
          <MoreHorizontal className="h-4 w-4 opacity-80" aria-hidden />
        </div>

        <div className="flex items-center gap-3 px-3 py-4">
          <WeatherIcon code={weather.code} className="shrink-0 text-[#f5d547]" />
          <p className="text-5xl font-extrabold tabular-nums leading-none tracking-tight">
            {weather.temperature}°
          </p>
          <label className="ml-auto inline-flex min-w-[7rem] items-center border border-white/70 bg-white/10 px-2 py-1.5">
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
              className="w-full cursor-pointer appearance-none bg-transparent text-sm font-semibold text-white outline-none disabled:opacity-60"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%23ffffff' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0 center",
                paddingRight: "1rem",
              }}
            >
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug} className="text-ink">
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="px-3 pb-3">
          <p className="border border-white/70 px-3 py-2.5 text-center text-sm font-bold uppercase tracking-wide">
            {weather.label}
          </p>
        </div>
      </div>
    </section>
  );
}
