"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Megaphone, Search, Droplets } from "lucide-react";
import {
  filterAnnouncements,
  isUtilityOutageAnnouncement,
  type MunicipalityAnnouncement,
} from "@/lib/municipality-announcements";
import { cn } from "@/lib/utils";

export function AnnouncementList({
  items,
  initialQuery = "",
  initialUtilityOnly = false,
}: {
  items: MunicipalityAnnouncement[];
  initialQuery?: string;
  initialUtilityOnly?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [utilityOnly, setUtilityOnly] = useState(initialUtilityOnly);

  const visible = useMemo(
    () => filterAnnouncements(items, query, utilityOnly),
    [items, query, utilityOnly],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
          <span className="font-semibold text-ink">Ara</span>
          <span className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Duyurularda ara…"
              className="min-h-[44px] w-full rounded-xl border border-border bg-white py-2 pl-10 pr-3 font-medium text-ink"
            />
          </span>
        </label>
        <button
          type="button"
          onClick={() => setUtilityOnly((value) => !value)}
          className={cn(
            "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors",
            utilityOnly
              ? "border-brand bg-brand text-white"
              : "border-border bg-white text-ink hover:border-brand/40",
          )}
        >
          <Droplets className="h-4 w-4" aria-hidden />
          Su / altyapı
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface/60 px-4 py-10 text-center">
          <p className="font-semibold text-ink">Gösterilecek duyuru bulunamadı.</p>
          <p className="mt-2 text-sm text-ink-soft">Arama metnini değiştirin veya filtreyi kapatın.</p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {visible.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/duyurular/${item.slug}`}
                className="group flex gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm transition-colors hover:border-brand/30"
              >
                {item.imageUrl ? (
                  <div className="relative hidden h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-surface sm:block">
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="112px"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="hidden h-20 w-28 shrink-0 items-center justify-center rounded-xl bg-surface sm:flex">
                    <Megaphone className="h-8 w-8 text-brand/70" aria-hidden />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-ink group-hover:text-brand">{item.title}</h2>
                  {isUtilityOutageAnnouncement(item.title) ? (
                    <span className="mt-2 inline-flex rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-900">
                      Altyapı
                    </span>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs leading-relaxed text-ink-soft">
        Duyurular düzenli olarak güncellenir. Resmi belgeler ve ek dosyalar ilgili duyuru sayfasında
        yer alır.
      </p>
    </div>
  );
}
