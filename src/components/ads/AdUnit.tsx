import { getActiveAd } from "@/lib/ads";
import { getAdSlotDef, parseSize, formatSlotSize } from "@/lib/ad-slots";
import { cn } from "@/lib/utils";

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
  const desktop = parseSize(def?.desktop);
  const mobile = parseSize(def?.mobile);

  return (
    <aside
      className={cn("flex justify-center py-3", className)}
      aria-label={`Reklam ${def?.name ?? code}`}
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
