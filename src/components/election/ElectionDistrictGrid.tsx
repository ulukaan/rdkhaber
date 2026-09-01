import { computeBoxPct, formatElectionCount, formatElectionPercent } from "@/lib/election";
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
  leadingPartyColor?: string;
  leadingVotes?: number;
  leadingPct?: number;
};

const DISTRICT_ACCENTS = [
  "from-brand/15 to-orange-500/10",
  "from-sky-500/15 to-blue-500/10",
  "from-emerald-500/15 to-teal-500/10",
  "from-violet-500/15 to-purple-500/10",
  "from-amber-500/15 to-yellow-500/10",
  "from-rose-500/15 to-pink-500/10",
  "from-cyan-500/15 to-sky-500/10",
  "from-lime-500/15 to-green-500/10",
];

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
    <section className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-ink">İlçe sonuçları</h2>
          <p className="text-sm text-ink-soft">Düzce ilçelerinde katılım ve önde görünen aday</p>
        </div>
        {selectedSlug && onSelect ? (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-semibold text-brand transition-colors hover:border-brand"
          >
            Tümünü göster
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {districts.map((district, index) => {
          const boxPct = computeBoxPct(district.openBoxes, district.totalBoxes);
          const active = selectedSlug === district.slug;
          const accent = DISTRICT_ACCENTS[index % DISTRICT_ACCENTS.length];
          return (
            <button
              key={district.id}
              type="button"
              onClick={() => onSelect?.(active ? null : district.slug)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                active ? "border-brand ring-2 ring-brand/20" : "border-border",
              )}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", accent)} aria-hidden />
              <div className="relative">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-extrabold text-ink">{district.name}</h3>
                  <span className="rounded-lg bg-white/80 px-2 py-0.5 text-[11px] font-extrabold tabular-nums text-brand backdrop-blur-sm">
                    %{district.turnoutPct.toFixed(1)}
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                  Katılım oranı
                </p>

                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-[10px] font-semibold text-ink-soft">
                    <span>Sandık</span>
                    <span className="tabular-nums">{formatElectionPercent(boxPct)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-black/8">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${Math.min(100, boxPct)}%` }}
                    />
                  </div>
                </div>

                {district.leadingName ? (
                  <div className="mt-3 rounded-xl border border-white/60 bg-white/70 p-2.5 backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">Önde</p>
                    <p className="mt-0.5 text-sm font-extrabold text-ink">{district.leadingName}</p>
                    {district.leadingParty ? (
                      <p className="text-xs font-semibold text-ink-soft">{district.leadingParty}</p>
                    ) : null}
                    {district.leadingPct != null ? (
                      <p className="mt-1 text-sm font-extrabold tabular-nums text-brand">
                        {formatElectionPercent(district.leadingPct)}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
