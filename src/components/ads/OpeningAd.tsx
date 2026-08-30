import { getActiveAd } from "@/lib/ads";
import { AdModal } from "@/components/ads/AdModal";

export async function OpeningAd() {
  const ad = await getActiveAd("077");
  if (!ad) return null;
  return <AdModal imageUrl={ad.imageUrl} targetUrl={ad.targetUrl} name={ad.name} />;
}
