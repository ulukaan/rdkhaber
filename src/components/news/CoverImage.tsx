"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Kapak görseli yoksa (veya yüklenemezse) kategori rengine göre üretilen
// bir yer tutucu gösterir.
export function CoverImage({
  src,
  alt,
  color,
  className,
  sizes,
  priority = false,
  objectPosition,
  fallback = "label",
}: {
  src?: string | null;
  alt: string;
  color?: string | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
  objectPosition?: string;
  fallback?: "label" | "wash";
}) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    const remote = /^https?:\/\//i.test(src);
    const localUpload = src.startsWith("/uploads/");
    return (
      <div className={cn("relative overflow-hidden bg-surface", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes ?? "100vw"}
          unoptimized={remote || localUpload}
          className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
          style={objectPosition ? { objectPosition } : undefined}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  const bg = color ?? "#d0021b";
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ background: `linear-gradient(160deg, ${bg} 0%, #1a1f28 72%)` }}
      aria-hidden={fallback === "wash"}
    >
      {fallback === "label" ? (
        <span className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm font-bold uppercase tracking-wide text-white/90">
          {alt}
        </span>
      ) : null}
    </div>
  );
}
