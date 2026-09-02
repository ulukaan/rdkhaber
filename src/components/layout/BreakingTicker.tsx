import { getBreakingTickerItems } from "@/lib/articles";
import { BreakingTickerClient } from "@/components/layout/BreakingTickerClient";

export async function BreakingTicker() {
  const items = await getBreakingTickerItems();
  return <BreakingTickerClient initialItems={items} />;
}
