import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Yerli Üretim rozeti — şeffaf PNG.
 * Açık: kırmızı · Koyu: gri
 */
export function YerliUretimBadge({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-8 w-[7.5rem] shrink-0 sm:h-9 sm:w-[8.5rem]", className)}>
      <Image
        src="/brand/yerli-uretim-light.png"
        alt="Yerli Üretim"
        fill
        className="object-contain object-right yerli-logo-light"
        sizes="136px"
        unoptimized
        priority
      />
      <Image
        src="/brand/yerli-uretim-dark.png"
        alt=""
        fill
        className="object-contain object-right yerli-logo-dark"
        sizes="136px"
        unoptimized
        aria-hidden
      />
    </span>
  );
}
