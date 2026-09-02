import { getActiveAd } from "@/lib/ads";
import { getSettings } from "@/lib/settings";
import { getAdSlotDef, parseSize, formatSlotSize } from "@/lib/ad-slots";
import { cn } from "@/lib/utils";
import { GoogleAdUnitGate } from "@/components/ads/GoogleAdUnitGate";

export async function AdUnit({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  // Slotta aktif reklam yoksa hiçbir şey basılmaz — boş reklam alanı gösterilmez.
  const ad = await getActiveAd(code);
  if (!ad) return null;

  const def = getAdSlotDef(code);
  const label = def?.name ?? code;

  if (ad.kind === "ADSENSE" && ad.adsenseSlot) {
    const settings = await getSettings();
    const client = settings.googleAdsenseClient.trim();
    if (!client) return null;

    return (
      <GoogleAdUnitGate
        client={client}
        slot={ad.adsenseSlot}
        layout={ad.adsenseLayout}
        format={ad.adsenseFormat}
        label={label}
        className={cn("flex justify-center py-3", className)}
      />
    );
  }

  if (!ad.imageUrl || !ad.targetUrl) return null;

  const desktop = parseSize(def?.desktop);
  const mobile = parseSize(def?.mobile);

  return (
    <aside
      className={cn("flex justify-center py-3", className)}
      aria-label={`Reklam ${label}`}
    >
      <a
        href={ad.targetUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block w-full max-w-full"
        style={desktop ? { maxWidth: desktop.w } : undefined}
      >
        <span className="mb-1 block text-center text-[10px] font-semibold uppercase tracking-widest text-ink-soft">
          Reklam
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ad.imageUrl}
          alt={ad.name}
          width={desktop?.w ?? mobile?.w}
          height={desktop?.h ?? mobile?.h}
          className="mx-auto block h-auto w-full max-w-full object-contain"
        />
        {def && formatSlotSize(def) ? (
          <span className="sr-only">{formatSlotSize(def)}</span>
        ) : null}
      </a>
    </aside>
  );
}
