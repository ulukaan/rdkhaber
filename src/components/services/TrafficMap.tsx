"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Navigation } from "lucide-react";
import { CITIES, DEFAULT_CITY_SLUG, resolveCity } from "@/lib/cities";
import {
  buildGoogleTrafficMapUrl,
  buildGoogleTrafficUrl,
  buildYandexTrafficWidgetUrl,
} from "@/lib/traffic";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function TrafficMap({ initialCity = DEFAULT_CITY_SLUG }: { initialCity?: string }) {
  const [citySlug, setCitySlug] = useState(initialCity);
  const city = useMemo(() => resolveCity(citySlug), [citySlug]);
  const widgetUrl = useMemo(() => buildYandexTrafficWidgetUrl(city), [city]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-semibold text-ink">İl / bölge</span>
          <select
            value={citySlug}
            onChange={(e) => setCitySlug(e.target.value)}
            className="min-h-[44px] rounded-xl border border-border bg-white px-3 py-2 font-medium text-ink"
          >
            {CITIES.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button href={buildGoogleTrafficMapUrl(city)} variant="outline" size="sm">
            <ExternalLink className="h-4 w-4" aria-hidden />
            Haritada aç
          </Button>
          <Button href={buildGoogleTrafficUrl(city)} variant="outline" size="sm">
            <Navigation className="h-4 w-4" aria-hidden />
            Yol tarifi
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <iframe
          key={widgetUrl}
          src={widgetUrl}
          title={`${city.name} trafik haritası`}
          className="min-h-[420px] w-full border-0 sm:min-h-[520px] lg:min-h-[600px]"
          loading="lazy"
          allow="fullscreen"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { color: "bg-emerald-500", label: "Akıcı" },
          { color: "bg-amber-400", label: "Yoğun" },
          { color: "bg-red-500", label: "Tıkalı" },
        ].map((item) => (
          <div
            key={item.label}
            className={cn(
              "flex min-h-[44px] items-center gap-2 rounded-xl border border-border bg-surface/60 px-3 text-sm font-semibold text-ink",
            )}
          >
            <span className={cn("h-3 w-3 rounded-full", item.color)} aria-hidden />
            {item.label}
          </div>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-ink-soft">
        Yoğunluk anlık değişebilir. Kritik güzergâhlar için harita görünümünü ayrıca kontrol etmenizi
        öneririz.
      </p>
    </div>
  );
}
