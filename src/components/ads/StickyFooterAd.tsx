import { AdUnit } from "@/components/ads/AdUnit";
import { getActiveAd } from "@/lib/ads";

export async function StickyFooterAd() {
  const ad = await getActiveAd("153");
  if (!ad) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_rgba(20,24,31,0.08)] backdrop-blur">
      <AdUnit code="153" className="py-2" />
    </div>
  );
}
