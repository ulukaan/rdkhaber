"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronDown, MapPin, Phone } from "lucide-react";
import { DUZCE_DISTRICTS, type DutyPharmacy } from "@/lib/pharmacy";
import { loadDutyPharmaciesAction } from "@/actions/pharmacy";
import { cn } from "@/lib/utils";

function PharmacyCross() {
  return (
    <span
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center bg-white text-lg font-black text-brand"
      aria-hidden
    >
      E
    </span>
  );
}

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("0")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`;
  }
  if (digits.length === 10) {
    return `0${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
  }
  return phone;
}

export function SidebarPharmacy({
  initialDistrict = "merkez",
  initialPharmacies = [],
}: {
  initialDistrict?: string;
  initialPharmacies?: DutyPharmacy[];
}) {
  const [district, setDistrict] = useState(initialDistrict);
  const [items, setItems] = useState(initialPharmacies);
  const [openId, setOpenId] = useState(initialPharmacies[0]?.name ?? "");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const districtName = useMemo(
    () => DUZCE_DISTRICTS.find((d) => d.slug === district)?.name ?? "Merkez",
    [district],
  );

  function onDistrictChange(slug: string) {
    setDistrict(slug);
    setError(null);
    start(async () => {
      const result = await loadDutyPharmaciesAction(slug);
      if (result && "error" in result) {
        setError(result.error ?? null);
        setItems([]);
        setOpenId("");
        return;
      }
      const next = result?.items ?? [];
      setItems(next);
      setOpenId(next[0]?.name ?? "");
    });
  }

  return (
    <section aria-label="Nöbetçi eczane">
      <div className="overflow-hidden bg-brand text-white">
        <div className="flex items-center gap-2 px-3 pt-3">
          <PharmacyCross />
          <h2 className="shrink-0 text-sm font-extrabold uppercase tracking-wide">Nöbetçi Eczane</h2>
          <span className="h-px min-w-0 flex-1 bg-white/35" aria-hidden />
        </div>

        <div className="flex items-center gap-2 px-3 py-2">
          <span className="shrink-0 text-[11px] font-semibold text-white/85">Düzce</span>
          <span className="h-3 w-px shrink-0 bg-white/35" aria-hidden />
          <label className="min-w-0 flex-1">
            <span className="sr-only">İlçe seçimi</span>
            <select
              value={district}
              disabled={pending}
              aria-label="İlçe seçimi"
              onChange={(e) => onDistrictChange(e.target.value)}
              className="w-full cursor-pointer appearance-none border border-white/50 bg-white/10 px-2 py-1 text-[11px] font-semibold text-white outline-none disabled:opacity-60"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5' viewBox='0 0 10 6'%3E%3Cpath fill='%23ffffff' d='M0 0l5 6 5-6z'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.4rem center",
                paddingRight: "1.25rem",
              }}
            >
              {DUZCE_DISTRICTS.map((d) => (
                <option key={d.slug} value={d.slug} className="text-ink">
                  {d.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mx-2 mb-2 overflow-hidden border border-white/20 bg-white text-ink">
          {pending ? (
            <p className="px-3 py-6 text-center text-sm text-ink-soft">Yükleniyor…</p>
          ) : error ? (
            <div className="space-y-2 px-3 py-4 text-center text-sm">
              <p className="text-ink-soft">{error}</p>
              <Link href={`/eczane?ilce=${district}`} className="font-semibold text-brand hover:underline">
                Tüm listeyi aç →
              </Link>
            </div>
          ) : items.length === 0 ? (
            <div className="space-y-2 px-3 py-4 text-center text-sm">
              <p className="text-ink-soft">{districtName} için kayıt bulunamadı.</p>
              <Link href={`/eczane?ilce=${district}`} className="font-semibold text-brand hover:underline">
                Eczane sayfasına git →
              </Link>
            </div>
          ) : (
            <ul>
              {items.slice(0, 6).map((item) => {
                const open = openId === item.name;
                return (
                  <li key={`${item.name}-${item.phone}`} className="border-b border-border last:border-b-0">
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? "" : item.name)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-3 py-3 text-left transition-colors",
                        open ? "bg-surface" : "bg-white hover:bg-surface/70",
                      )}
                      aria-expanded={open}
                    >
                      <span className="min-w-0 truncate text-sm font-extrabold uppercase tracking-wide text-ink">
                        {item.name}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 text-ink-soft transition-transform",
                          open && "rotate-180 text-brand",
                        )}
                        aria-hidden
                      />
                    </button>
                    {open ? (
                      <div className="space-y-2.5 bg-surface/50 px-3 pb-3 pt-0.5">
                        <p className="flex items-start gap-2 text-sm leading-snug text-ink">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                          <span>{item.address}</span>
                        </p>
                        <div className="flex flex-col gap-2">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${item.address}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
                          >
                            <MapPin className="h-3.5 w-3.5" aria-hidden />
                            Haritada Göster
                          </a>
                          {item.phone ? (
                            <a
                              href={`tel:${item.phone.replace(/\s/g, "")}`}
                              className="inline-flex w-full items-center justify-center gap-2 bg-brand px-3 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                            >
                              <Phone className="h-4 w-4" aria-hidden />
                              {formatPhone(item.phone)}
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="px-3 pb-3">
          <Link
            href={`/eczane?ilce=${district}`}
            className="block text-center text-[11px] font-semibold uppercase tracking-wide text-white/90 hover:text-white"
          >
            Tüm nöbetçi eczaneler →
          </Link>
        </div>
      </div>
    </section>
  );
}
