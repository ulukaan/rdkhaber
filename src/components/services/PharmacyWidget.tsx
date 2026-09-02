"use client";

import { useMemo, useState } from "react";
import { Phone, MapPin } from "lucide-react";
import { buildPharmacyWidgetUrl, DUZCE_DISTRICTS, type DutyPharmacy } from "@/lib/pharmacy";
import { cn } from "@/lib/utils";

export function PharmacyWidget({
  initialDistrict = "merkez",
  apiPharmacies = null,
}: {
  initialDistrict?: string;
  apiPharmacies?: DutyPharmacy[] | null;
}) {
  const [district, setDistrict] = useState(initialDistrict);
  const widgetUrl = useMemo(() => buildPharmacyWidgetUrl(district), [district]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        {DUZCE_DISTRICTS.map((item) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => setDistrict(item.slug)}
            className={cn(
              "min-h-[44px] rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
              district === item.slug
                ? "border-brand bg-brand text-white"
                : "border-border bg-white text-ink hover:border-brand/40",
            )}
          >
            {item.name}
          </button>
        ))}
      </div>

      {apiPharmacies && apiPharmacies.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {apiPharmacies.map((item) => (
            <li
              key={`${item.name}-${item.phone}`}
              className="rounded-2xl border border-border bg-white p-4 shadow-sm"
            >
              <h3 className="font-bold text-ink">{item.name}</h3>
              {item.district ? (
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand">
                  {item.district}
                </p>
              ) : null}
              <p className="mt-2 flex items-start gap-2 text-sm text-ink-soft">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {item.address}
              </p>
              {item.phone ? (
                <a
                  href={`tel:${item.phone.replace(/\s/g, "")}`}
                  className="mt-3 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-brand hover:underline"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  {item.phone}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <iframe
            key={widgetUrl}
            src={widgetUrl}
            title="Nöbetçi eczaneler"
            className="min-h-[520px] w-full border-0 sm:min-h-[640px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      <p className="text-xs leading-relaxed text-ink-soft">
        Eczaneler ertesi gün <strong>08:30</strong>&apos;a kadar nöbetçidir. Gitmeden önce telefonla
        teyit etmenizi öneririz.
      </p>
    </div>
  );
}
