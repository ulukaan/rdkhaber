import { SidebarWidget } from "@/components/news/SidebarWidget";
import { SidebarNewsList } from "@/components/news/SidebarNewsList";
import { SidebarParity } from "@/components/news/SidebarParity";
import { AdUnit } from "@/components/ads/AdUnit";
import { formatChange, formatMarketValue, type MarketGroup, type MarketItem } from "@/lib/rates";
import { categoryHref } from "@/lib/category-path";
import { cn } from "@/lib/utils";
import type { ArticleSummary } from "@/types/article";

function MarketGroupList({ group }: { group: MarketGroup }) {
  const items = group.items.slice(0, 6);
  if (items.length === 0) return null;

  return (
    <SidebarWidget title={group.label}>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <MarketRow key={item.code} item={item} />
        ))}
      </ul>
    </SidebarWidget>
  );
}

function MarketRow({ item }: { item: MarketItem }) {
  const up = (item.change ?? 0) > 0;
  const down = (item.change ?? 0) < 0;
  return (
    <li className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0">
      <span className="text-[12px] font-bold text-ink">{item.label}</span>
      <span className="text-right">
        <span className="block text-[13px] font-extrabold tabular-nums text-ink">
          {formatMarketValue(item)}
        </span>
        {item.change != null ? (
          <span
            className={cn(
              "text-[11px] font-semibold tabular-nums",
              up && "text-emerald-700",
              down && "text-brand",
              !up && !down && "text-ink-soft",
            )}
          >
            {formatChange(item.change)}
          </span>
        ) : null}
      </span>
    </li>
  );
}

export function EconomyCategoryAside({
  parityItems,
  marketGroups = [],
  mostRead,
  latest,
  categoryName,
  categorySlug,
  showParity = false,
}: {
  parityItems: MarketItem[];
  marketGroups?: MarketGroup[];
  mostRead: ArticleSummary[];
  latest: ArticleSummary[];
  categoryName: string;
  categorySlug: string;
  showParity?: boolean;
}) {
  const detailGroups = marketGroups.filter((g) => g.id === "index" || g.id === "crypto");

  return (
    <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
      {showParity && parityItems.length > 0 ? <SidebarParity items={parityItems} /> : null}

      {detailGroups.map((group) => (
        <MarketGroupList key={group.id} group={group} />
      ))}

      {mostRead.length > 0 ? (
        <SidebarWidget title="Çok okunan" href={categoryHref(categorySlug)}>
          <SidebarNewsList articles={mostRead.slice(0, 6)} ranked />
        </SidebarWidget>
      ) : latest.length > 0 ? (
        <SidebarWidget title={categoryName} href={categoryHref(categorySlug)}>
          <SidebarNewsList articles={latest.slice(0, 5)} />
        </SidebarWidget>
      ) : null}

      <AdUnit code="009" />
    </aside>
  );
}
