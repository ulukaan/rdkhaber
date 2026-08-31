import { getBreakingTickerItems } from "@/lib/articles";
import { Container } from "@/components/ui/Container";
import { BreakingTickerTrack } from "@/components/layout/BreakingTickerTrack";

export async function BreakingTicker() {
  const items = await getBreakingTickerItems();
  if (items.length === 0) return null;

  return (
    <div
      className="bg-brand text-white"
      role="region"
      aria-label="Son dakika haberleri"
    >
      <Container className="flex items-stretch">
        <span className="flex shrink-0 items-center bg-ink px-3 text-[11px] font-black uppercase tracking-[0.14em] sm:px-4">
          Son Dakika
        </span>
        <BreakingTickerTrack items={items} />
      </Container>
    </div>
  );
}
