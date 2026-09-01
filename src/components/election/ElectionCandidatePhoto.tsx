"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ElectionCandidatePhoto({
  src,
  fallbackSrc,
  alt = "",
  className,
  sizes,
  priority,
}: {
  src: string;
  fallbackSrc: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      className={cn("object-cover", currentSrc.includes("aday.svg") && "object-contain p-2 bg-surface", className)}
      sizes={sizes}
      priority={priority}
      unoptimized
      onError={() => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
    />
  );
}
