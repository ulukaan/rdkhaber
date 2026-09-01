"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { DUZCE_MAP_REGIONS, DUZCE_MAP_VIEWBOX } from "@/lib/duzce-map-paths";
import { NTV_DEFAULT_PARTY_COLOR, resolvePartyColor } from "@/lib/election-candidate-photo";
import type { ElectionDistrictView } from "@/components/election/ElectionDistrictGrid";

export function ElectionDuzceMap({
  districts,
  selectedSlug,
  className,
}: {
  districts: ElectionDistrictView[];
  selectedSlug?: string | null;
  className?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const districtMap = new Map(districts.map((d) => [d.slug, d]));
  const focusSlug = hovered ?? selectedSlug;
  const active = focusSlug ? districtMap.get(focusSlug) : null;

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={DUZCE_MAP_VIEWBOX}
        className="h-auto w-full max-h-[480px]"
        role="img"
        aria-label="Düzce ilçe haritası"
      >
        <defs>
          <filter id="duzce-map-shadow" x="-4%" y="-4%" width="108%" height="108%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#14181f" floodOpacity="0.12" />
          </filter>
        </defs>

        <g filter="url(#duzce-map-shadow)">
          {DUZCE_MAP_REGIONS.map((region) => {
            const district = districtMap.get(region.slug);
            const fill = district?.leadingParty
            ? resolvePartyColor(district.leadingParty, district.leadingPartyColor)
            : NTV_DEFAULT_PARTY_COLOR;
            const isActive = focusSlug === region.slug;
            return (
              <path
                key={region.slug}
                d={region.d}
                fill={fill}
                stroke="#fff"
                strokeWidth={isActive ? 2.5 : 1.5}
                className="cursor-pointer transition-all duration-200"
                style={{
                  filter: isActive ? "brightness(1.06)" : undefined,
                  opacity: focusSlug && !isActive ? 0.78 : 1,
                }}
                onMouseEnter={() => setHovered(region.slug)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(region.slug)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
                role="button"
                aria-label={region.label}
              />
            );
          })}
        </g>

        {DUZCE_MAP_REGIONS.map((region) => {
          const isActive = focusSlug === region.slug;
          return (
            <text
              key={`label-${region.slug}`}
              x={region.labelX}
              y={region.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              pointerEvents="none"
              fill={isActive ? "#ffffff" : "#14181f"}
              stroke={isActive ? "rgba(20,24,31,0.35)" : "#ffffff"}
              strokeWidth={isActive ? 0.5 : 2.5}
              paintOrder="stroke fill"
              fontSize={11}
              fontWeight={700}
              style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}
            >
              {region.label}
            </text>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 border border-border/60 bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm">
        {active ? (
          <div className="text-sm">
            <p className="font-extrabold uppercase text-ink">{active.name}</p>
            {active.leadingName ? (
              <p className="mt-0.5 text-xs text-ink-soft">
                Önde: <strong className="text-ink">{active.leadingName}</strong>
                {active.leadingParty ? ` (${active.leadingParty})` : ""}
                {active.leadingPct != null ? ` · %${active.leadingPct.toFixed(2)}` : ""}
              </p>
            ) : (
              <p className="text-xs text-ink-soft">Sonuç bekleniyor</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-ink-soft">İlçenin üzerine gelerek önde görünen adayı görün</p>
        )}
      </div>
    </div>
  );
}
