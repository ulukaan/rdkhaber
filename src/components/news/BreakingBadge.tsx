import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type BreakingBadgeProps = {
  className?: string;
  /** Görsel üstü manşet/kart için daha belirgin efektli rozet */
  variant?: "default" | "overlay";
};

export function BreakingBadge({ className, variant = "default" }: BreakingBadgeProps) {
  if (variant === "overlay") {
    return (
      <span
        className={cn(
          "breaking-overlay-badge inline-flex min-h-[28px] items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white sm:min-h-[32px] sm:px-3 sm:py-1.5 sm:text-[11px]",
          className,
        )}
      >
        <span className="breaking-live-dot h-2 w-2 shrink-0 rounded-full bg-white" aria-hidden />
        Son Dakika
      </span>
    );
  }

  return (
    <Badge variant="live" className={cn("shadow-sm", className)}>
      Son Dakika
    </Badge>
  );
}

/** Görsel üzerinde konumlandırılmış son dakika rozeti. */
export function BreakingImageStamp({ className }: { className?: string }) {
  return (
    <span
      className={cn("pointer-events-none absolute left-3 top-3 z-[3] sm:left-4 sm:top-4", className)}
      aria-hidden
    >
      <BreakingBadge variant="overlay" />
    </span>
  );
}
