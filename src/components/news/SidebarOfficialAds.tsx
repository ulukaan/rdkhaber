"use client";

import { useEffect, useMemo, useState } from "react";
import {
  OFFICIAL_AD_TYPES,
  getOfficialAdsListUrl,
  type OfficialAd,
  type OfficialAdType,
  type OfficialAdsBundle,
} from "@/lib/official-ads";
import { cn } from "@/lib/utils";

const ROTATE_MS = 5000;

function IlanGovLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="shrink-0">
        <circle cx="12" cy="12" r="12" fill="#F5C518" />
        <rect x="7" y="6.5" width="10" height="11" rx="1.2" fill="#fff" />
        <rect x="9" y="9" width="6" height="1.2" rx="0.6" fill="#F5C518" />
        <rect x="9" y="11.5" width="6" height="1.2" rx="0.6" fill="#F5C518" />
        <rect x="9" y="14" width="4" height="1.2" rx="0.6" fill="#F5C518" />
      </svg>
      <span className="text-[11px] font-semibold tracking-tight text-white">ilan.gov.tr</span>
    </span>
  );
}

function BikLogo({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <rect width="24" height="24" rx="2" fill="#2A9B9B" />
      <path
        fill="#fff"
        d="M4.8 6.2h5.4c2 0 3.25 1.1 3.25 2.7 0 1-.55 1.8-1.45 2.2 1.1.4 1.75 1.3 1.75 2.45 0 1.8-1.4 3-3.65 3H4.8V6.2zm2.3 3.9h2.85c.8 0 1.25-.4 1.25-1.1s-.45-1.05-1.25-1.05H7.1v2.15zm0 4.55h3.15c.9 0 1.4-.45 1.4-1.2s-.5-1.2-1.4-1.2H7.1v2.4z"
      />
      <path fill="#F0C14B" d="M16.2 17.8V6.2H20v2.15h-1.7V17.8H16.2z" />
    </svg>
  );
}

function formatCityLine(ad: OfficialAd) {
  const city = (ad.city || "Düzce").toLocaleUpperCase("tr-TR");
  const county = ad.county?.trim();
  if (!county) return city;
  const countyLabel =
    county.length <= 3
      ? county.toLocaleUpperCase("tr-TR")
      : county.charAt(0).toLocaleUpperCase("tr-TR") + county.slice(1);
  return `${city} • ${countyLabel}`;
}

export function SidebarOfficialAds({ data }: { data: OfficialAdsBundle }) {
  const firstWithItems =
    OFFICIAL_AD_TYPES.find((t) => (data.byType[t.key]?.length ?? 0) > 0)?.key ?? "icra";
  const [activeType, setActiveType] = useState<OfficialAdType>(firstWithItems);
  const [index, setIndex] = useState(0);

  const items = data.byType[activeType] ?? [];
  const total = Math.max(data.totals[activeType] ?? items.length, items.length);
  const current = items[index] ?? null;

  const hasAny = useMemo(
    () => OFFICIAL_AD_TYPES.some((t) => (data.byType[t.key]?.length ?? 0) > 0),
    [data],
  );

  useEffect(() => {
    setIndex(0);
  }, [activeType]);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [items.length, activeType]);

  if (!hasAny) return null;

  return (
    <section aria-label="Resmi ilanlar" className="overflow-hidden border border-[#d8d8d8] bg-white">
      <div className="grid grid-cols-4">
        {OFFICIAL_AD_TYPES.map((tab) => {
          const active = activeType === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveType(tab.key)}
              className={cn(
                "relative flex min-h-[44px] items-center justify-center px-0.5 py-2 text-center text-[9px] font-extrabold uppercase leading-tight tracking-wide text-white sm:text-[10px]",
                active ? "z-[1]" : "opacity-95 hover:opacity-100",
              )}
              style={{ backgroundColor: tab.color }}
              aria-pressed={active}
            >
              <span className="block px-0.5">
                {tab.key === "personel" ? (
                  <>
                    PERSONEL
                    <br />
                    ALIMI
                  </>
                ) : (
                  tab.label
                )}
              </span>
              {active ? (
                <span
                  className="absolute -bottom-1.5 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[7px] border-x-transparent"
                  style={{ borderTopColor: tab.color }}
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="min-h-[108px] px-4 pb-4 pt-5">
        {current ? (
          <a
            href={current.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block outline-none focus-visible:ring-2 focus-visible:ring-[#5BA3D9]/40"
          >
            <p className="text-[13px] font-semibold tracking-wide text-[#5BA3D9]">
              {formatCityLine(current)}
            </p>
            <p className="mt-2 line-clamp-3 text-[14px] leading-snug text-[#8a8a8a]">
              {current.title}
            </p>
          </a>
        ) : (
          <p className="py-4 text-center text-sm text-[#8a8a8a]">
            Bu kategoride Düzce ilanı bulunamadı.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 bg-[#555555] px-3 py-2">
        <p className="tabular-nums text-white" aria-live="polite">
          {items.length > 0 ? (
            <>
              <span className="text-[15px] font-bold">{index + 1}</span>
              <span className="text-[12px] font-medium text-white/85"> / {total}</span>
            </>
          ) : (
            <span className="text-[12px] text-white/80">0 / 0</span>
          )}
        </p>
        <div className="flex items-center gap-3">
          <a
            href={getOfficialAdsListUrl(activeType)}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-95 transition-opacity hover:opacity-100"
            aria-label="ilan.gov.tr"
          >
            <IlanGovLogo />
          </a>
          <a
            href="https://www.bik.gov.tr/"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-95 transition-opacity hover:opacity-100"
            aria-label="Basın İlan Kurumu"
            title="Basın İlan Kurumu"
          >
            <BikLogo />
          </a>
        </div>
      </div>
    </section>
  );
}
