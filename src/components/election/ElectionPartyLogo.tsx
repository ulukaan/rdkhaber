"use client";

import { useState } from "react";
import Image from "next/image";
import { resolveNtvPartyLogoUrl } from "@/lib/election-candidate-photo";
import { cn } from "@/lib/utils";

export function ElectionPartyLogo({
  partyName,
  partyColor,
  size = 35,
  className,
}: {
  partyName: string;
  partyColor: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = resolveNtvPartyLogoUrl(partyName);

  if (!src || failed) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full font-extrabold uppercase text-white shadow-sm ring-2 ring-white",
          className,
        )}
        style={{
          width: size,
          height: size,
          backgroundColor: partyColor,
          fontSize: Math.max(8, Math.round(size * 0.28)),
        }}
        title={partyName}
      >
        {partyName.slice(0, 2)}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={partyName}
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full bg-white object-contain shadow-sm ring-2 ring-white", className)}
      unoptimized
      onError={() => setFailed(true)}
    />
  );
}
