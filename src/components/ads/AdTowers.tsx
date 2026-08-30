import { AdUnit } from "@/components/ads/AdUnit";
import { getActiveAd } from "@/lib/ads";

export async function AdTowers() {
  // Kule slotları boşsa sabit konumlu kapsayıcılar da basılmaz.
  const [left, right] = await Promise.all([getActiveAd("036"), getActiveAd("009")]);
  if (!left && !right) return null;

  return (
    <>
      {left ? (
        <div className="pointer-events-none fixed top-36 left-2 z-30 hidden min-[1620px]:block">
          <div className="pointer-events-auto w-[160px]">
            <AdUnit code="036" className="py-0" />
          </div>
        </div>
      ) : null}
      {right ? (
        <div className="pointer-events-none fixed top-36 right-2 z-30 hidden min-[1620px]:block">
          <div className="pointer-events-auto w-[160px]">
            <AdUnit code="009" className="py-0" />
          </div>
        </div>
      ) : null}
    </>
  );
}
