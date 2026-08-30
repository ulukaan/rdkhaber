"use client";

import Link from "next/link";
import { useState } from "react";
import type { HoroscopeItem } from "@/lib/horoscope";
import { shortenHoroscope } from "@/lib/horoscope";
import { cn } from "@/lib/utils";

function formatDateTr(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function HoroscopeStrip({ items }: { items: HoroscopeItem[] }) {
  const [active, setActive] = useState(items[0]?.slug ?? "");
  const current = items.find((i) => i.slug === active) ?? items[0];
  if (!current) return null;

  return (
    <section
      className="relative mt-4 overflow-hidden border border-[#1c2438] bg-[#121826]"
      aria-label="Günlük burç yorumları"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 18%, rgba(212,181,106,0.18), transparent 28%), radial-gradient(circle at 88% 12%, rgba(244,239,228,0.08), transparent 22%), radial-gradient(circle at 70% 80%, rgba(212,181,106,0.1), transparent 30%)",
        }}
        aria-hidden
      />
      <div className="relative px-3 py-3 sm:px-4 sm:py-3.5">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d4b56a]">
              Astroloji
            </p>
            <h2 className="text-base font-black tracking-tight text-[#f4efe4] sm:text-lg">
              Günlük Burç
            </h2>
          </div>
          <p className="text-[11px] font-medium text-[#f4efe4]/70">{formatDateTr(current.tarih)}</p>
        </div>

        <ul
          className="mb-3 grid grid-cols-6 gap-1 sm:grid-cols-12"
          role="tablist"
          aria-label="Burç seçin"
        >
          {items.map((item) => {
            const on = item.slug === current.slug;
            return (
              <li key={item.slug}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={on}
                  title={item.label}
                  onClick={() => setActive(item.slug)}
                  className={cn(
                    "flex w-full flex-col items-center gap-0.5 rounded-md px-0.5 py-1.5 transition-colors",
                    on
                      ? "bg-[#d4b56a] text-[#121826]"
                      : "bg-white/5 text-[#f4efe4]/75 hover:bg-white/10 hover:text-[#f4efe4]",
                  )}
                >
                  <span className="text-[1.05rem] leading-none" aria-hidden>
                    {item.symbol}
                  </span>
                  <span className="hidden text-[8px] font-bold uppercase tracking-wide sm:block">
                    {item.label.slice(0, 3)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="relative overflow-hidden rounded-md border border-[#d4b56a]/25 bg-[#0d1320]/80 px-3 py-3 sm:px-4">
          <span
            className="pointer-events-none absolute -right-1 -top-3 text-[5.5rem] leading-none text-[#d4b56a]/15"
            aria-hidden
          >
            {current.symbol}
          </span>
          <div className="relative flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-lg font-black text-[#f4efe4]">{current.label}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#d4b56a]">
              {current.dates}
            </p>
          </div>
          <p className="relative mt-2 max-w-3xl text-[13px] leading-relaxed text-[#f4efe4]/88 sm:text-sm">
            {shortenHoroscope(current.yorum)}
          </p>
          <Link
            href="/burclar"
            className="relative mt-2.5 inline-flex text-[10px] font-bold uppercase tracking-[0.14em] text-[#d4b56a] hover:text-[#f0d78a]"
          >
            Tüm burçlar →
          </Link>
        </div>
      </div>
    </section>
  );
}
