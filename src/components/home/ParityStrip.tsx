import { formatChange, formatMarketValue, type MarketItem } from "@/lib/rates";
import type { ParityDesign } from "@/lib/settings";
import { cn } from "@/lib/utils";

function Change({ value }: { value: number | null }) {
  if (value == null) return null;
  const up = value > 0;
  const down = value < 0;
  return (
    <span
      className={cn(
        "text-[11px] font-semibold tabular-nums",
        up && "text-emerald-700",
        down && "text-brand",
        !up && !down && "text-ink-soft",
      )}
    >
      {formatChange(value)}
    </span>
  );
}

function Design1({ items }: { items: MarketItem[] }) {
  return (
    <section className="overflow-hidden border border-border" aria-label="Parite">
      <div className="flex flex-col lg:flex-row">
        <div className="flex shrink-0 items-center bg-brand px-4 py-3 text-white lg:w-36 lg:justify-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/80">Parite</p>
            <p className="text-sm font-extrabold">Düzce</p>
          </div>
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-2 bg-ink sm:grid-cols-4 lg:grid-cols-8">
          {items.map((item) => {
            const up = (item.change ?? 0) > 0;
            const down = (item.change ?? 0) < 0;
            return (
              <div key={item.code} className="border-l border-white/10 px-3 py-2.5 first:border-l-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-white/60">{item.label}</p>
                <p className="mt-0.5 text-sm font-extrabold tabular-nums text-white">
                  {formatMarketValue(item)}
                </p>
                {item.change != null ? (
                  <p
                    className={cn(
                      "text-[11px] font-semibold tabular-nums",
                      up && "text-emerald-400",
                      down && "text-red-300",
                      !up && !down && "text-white/50",
                    )}
                  >
                    {formatChange(item.change)}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Design2({ items }: { items: MarketItem[] }) {
  return (
    <section className="border border-border bg-white" aria-label="Parite">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
        {items.map((item, i) => (
          <div
            key={item.code}
            className={cn("px-3 py-2.5", i > 0 && "border-t border-border sm:border-t-0 sm:border-l")}
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">{item.label}</p>
            <p className="mt-0.5 text-sm font-extrabold tabular-nums text-ink">
              {formatMarketValue(item)}
            </p>
            <Change value={item.change} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ParityItem({ item }: { item: MarketItem }) {
  return (
    <div className="flex shrink-0 items-baseline gap-1.5 border-l border-border pl-3">
      <span className="text-[11px] font-bold uppercase text-ink-soft">{item.label}</span>
      <span className="text-xs font-extrabold tabular-nums text-ink">{formatMarketValue(item)}</span>
      <Change value={item.change} />
    </div>
  );
}

function Design3({ items }: { items: MarketItem[] }) {
  const loop = [...items, ...items];

  return (
    <section className="border border-border bg-white" aria-label="Parite">
      <div className="flex items-stretch">
        <span className="flex shrink-0 items-center px-3 text-[11px] font-extrabold uppercase tracking-wide text-brand">
          Parite
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden">
          <div className="ticker-track !gap-4 !py-2 !pl-0">
            {loop.map((item, i) => (
              <ParityItem key={`${item.code}-${i}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


export function ParityStrip({
  items,
  design = "2",
}: {
  items: MarketItem[];
  design?: ParityDesign;
}) {
  if (items.length === 0) return null;
  if (design === "1") return <Design1 items={items} />;
  if (design === "3") return <Design3 items={items} />;
  return <Design2 items={items} />;
}
