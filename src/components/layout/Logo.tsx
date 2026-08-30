import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  siteName,
  logoUrl,
  variant = "default",
}: {
  siteName: string;
  logoUrl?: string;
  variant?: "default" | "light";
}) {
  const parts = siteName.split(" ");
  const primary = parts[0];
  const rest = parts.slice(1).join(" ");

  if (logoUrl) {
    return (
      <Link
        href="/"
        className="relative flex h-9 w-[7.5rem] shrink-0 items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:w-36"
        aria-label={`${siteName} ana sayfa`}
      >
        <Image
          src={logoUrl}
          alt={siteName}
          fill
          className="object-contain object-left"
          sizes="144px"
          priority
          unoptimized
        />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-1 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      aria-label={`${siteName} ana sayfa`}
    >
      <span
        className={cn(
          "text-[1.45rem] font-black leading-none tracking-tight md:text-[1.65rem]",
          variant === "light" ? "text-white" : "text-ink",
        )}
      >
        {primary}
      </span>
      {rest ? (
        <span className="text-xl font-black tracking-tight text-brand">{rest}</span>
      ) : null}
    </Link>
  );
}
