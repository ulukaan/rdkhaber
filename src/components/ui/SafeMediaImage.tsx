"use client";

import { useState } from "react";
import { User } from "lucide-react";
import { avatarFallbackUrl, logoFallbackUrl } from "@/lib/media-fallback";
import { cn } from "@/lib/utils";

type SafeMediaImageProps = {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackName: string;
  variant?: "avatar" | "logo" | "cover";
  iconFallback?: boolean;
};

export function SafeMediaImage({
  src,
  alt = "",
  className,
  fallbackName,
  variant = "cover",
  iconFallback = false,
}: SafeMediaImageProps) {
  const primary = src?.trim() || "";
  const fallback =
    variant === "avatar"
      ? avatarFallbackUrl(fallbackName, 176)
      : logoFallbackUrl(fallbackName, 128);

  const [current, setCurrent] = useState(primary || fallback);
  const [failed, setFailed] = useState(false);

  if (iconFallback && failed) {
    return (
      <span
        className={cn(
          "flex items-center justify-center bg-surface text-ink-soft",
          variant === "avatar" && "rounded-full",
          className,
        )}
      >
        <User className="h-10 w-10" aria-hidden />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (current !== fallback) {
          setCurrent(fallback);
          return;
        }
        setFailed(true);
      }}
    />
  );
}
