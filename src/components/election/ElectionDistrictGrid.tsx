import { computeBoxPct, formatElectionPercent } from "@/lib/election";
import { cn } from "@/lib/utils";

export type ElectionDistrictView = {
  id: string;
  name: string;
  slug: string;
  totalBoxes: number;
  openBoxes: number;
  turnoutPct: number;
  leadingName?: string;
  leadingParty?: string;
  leadingPct?: number;
};

export function ElectionDistrictGrid({
  districts,
  selectedSlug,
  onSelect,
}: {
  districts: ElectionDistrictView[];
  selectedSlug?: string | null;
  onSelect?: (slug: string | null) => void;
}) {
  if (districts.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-extrabold text-ink">Düzce ilçeleri</h2>
        {selectedSlug && onSelect ? (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-sm font-semibold text-brand hover:underline"
          >
            Tümünü göster
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {districts.map((district) => {
          const boxPct = computeBoxPct(district.openBoxes, district.totalBoxes);
          const active = selectedSlug === district.slug;
          return (
            <button
              key={district.id}
              type="button"
              onClick={() => onSelect?.(active ? null : district.slug)}
              className={cn(
                "rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                active ? "border-brand ring-1 ring-brand/20" : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-ink">{district.name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wide text-brand">
                  %{district.turnoutPct.toFixed(1)}
                </span>
              </div>
              <p className="mt-2 text-xs text-ink-soft">
                Sandık: {formatElectionPercent(boxPct)} açıldı
              </p>
              {district.leadingName ? (
                <p className="mt-2 text-xs font-semibold text-ink">
                  Önde: {district.leadingName}
                  {district.leadingPct != null ? ` · ${formatElectionPercent(district.leadingPct)}` : ""}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
