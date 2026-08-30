import { formatChange, formatMarketValue, type MarketItem } from "@/lib/rates";
import { cn } from "@/lib/utils";
import { SidebarWidget } from "@/components/news/SidebarWidget";

export function SidebarParity({ items }: { items: MarketItem[] }) {
  if (items.length === 0) return null;
  const shown = items.slice(0, 6);

  return (
    <SidebarWidget title="Piyasalar">
      <ul className="grid grid-cols-2 gap-2">
        {shown.map((item) => {
          const up = (item.change ?? 0) > 0;
          const down = (item.change ?? 0) < 0;
          return (
            <li key={item.code} className="border border-border bg-surface px-2.5 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                {item.label}
              </p>
              <p className="mt-0.5 text-sm font-extrabold tabular-nums text-ink">
                {formatMarketValue(item)}
              </p>
              {item.change != null ? (
                <p
                  className={cn(
                    "text-[11px] font-semibold tabular-nums",
                    up && "text-emerald-700",
                    down && "text-brand",
                    !up && !down && "text-ink-soft",
                  )}
                >
                  {formatChange(item.change)}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </SidebarWidget>
  );
}
