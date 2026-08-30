import { AdUnit } from "@/components/ads/AdUnit";
import { getActiveAd } from "@/lib/ads";

export async function HeaderAdBanner() {
  const ad = await getActiveAd("152");
  if (!ad) return null;

  return (
    <div className="border-b border-border bg-surface">
      <AdUnit code="152" className="py-3" />
    </div>
  );
}
