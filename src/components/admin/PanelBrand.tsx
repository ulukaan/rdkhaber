"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** Panel üst çubuğundaki marka — açık zeminde okunur. */
export function PanelBrand({
  href,
  siteName,
  logoUrl,
  roleLabel,
  onNavigate,
  compact = false,
  className,
}: {
  href: string;
  siteName: string;
  logoUrl?: string;
  roleLabel: string;
  onNavigate?: () => void;
  compact?: boolean;
  className?: string;
}) {
  const name = siteName.trim() || "Panel";
  const [primary, ...rest] = name.split(" ");

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn("flex min-w-0 items-center gap-3", className)}
      aria-label={`${name} paneli`}
    >
      {logoUrl ? (
        <span
          className={cn(
            "relative block h-9 shrink-0",
            compact ? "w-[7.5rem] sm:w-36" : "w-[150px]",
          )}
        >
          <Image
            src={logoUrl}
            alt={name}
            fill
            className="object-contain object-left"
            sizes="150px"
            priority
            unoptimized
          />
        </span>
      ) : (
        <span className="truncate text-[1.15rem] font-black leading-none tracking-tight text-ink">
          {primary}
          {rest.length > 0 ? <span className="text-brand"> {rest.join(" ")}</span> : null}
        </span>
      )}
      <span className="hidden h-6 w-px bg-border sm:block" aria-hidden />
      <span className="hidden rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand sm:inline">
        {roleLabel}
      </span>
    </Link>
  );
}
