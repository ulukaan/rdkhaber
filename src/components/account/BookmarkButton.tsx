"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { getArticleLibraryState, toggleBookmarkAction } from "@/actions/library";
import { cn } from "@/lib/utils";

export function BookmarkButton({
  articleId,
  loginHref = "/giris",
  variant = "meta",
}: {
  articleId: string;
  loginHref?: string;
  variant?: "meta" | "bar" | "tile" | "text" | "icon";
}) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getArticleLibraryState(articleId).then((state) => {
      if (cancelled) return;
      setLoggedIn(state.loggedIn);
      setSaved(state.bookmarked);
    });
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  const label = saved ? "Kayıtlı" : "Kaydet";
  const className =
    variant === "tile"
      ? cn(
          "flex min-h-[4.75rem] w-full flex-col items-center justify-center gap-1.5 rounded-lg bg-surface px-1 py-3 text-[11px] font-bold transition-colors",
          saved ? "bg-brand/10 text-brand" : "text-ink hover:bg-border/60",
        )
      : variant === "icon"
        ? cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-sm border transition-colors",
            saved
              ? "border-brand bg-brand text-white"
              : "border-border bg-white text-ink hover:border-brand hover:text-brand",
          )
        : variant === "bar"
      ? cn(
          "inline-flex h-10 items-center gap-1.5 border px-3.5 text-xs font-bold transition-colors",
          saved
            ? "border-brand bg-brand text-white"
            : "border-border bg-surface text-ink hover:border-brand hover:text-brand",
        )
      : variant === "text"
        ? "text-xs font-bold text-ink-soft hover:text-brand"
        : cn(
            "inline-flex h-8 items-center gap-1.5 rounded-sm px-2.5 text-[11px] font-bold transition-colors",
            saved ? "bg-brand text-white" : "bg-white text-ink hover:text-brand",
          );

  const icon = (
    variant === "tile" ? (
      <span
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full border",
          saved ? "border-brand bg-brand text-white" : "border-border bg-surface text-ink",
        )}
      >
        <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-current")} />
      </span>
    ) : (
      <Bookmark className={cn("h-3.5 w-3.5", saved && variant !== "bar" && "fill-current")} />
    )
  );

  const showLabel = variant !== "icon";

  if (loggedIn !== true) {
    return (
      <Link href={loginHref} className={className} title="Kaydetmek için giriş yapın">
        {icon}
        {showLabel ? "Kaydet" : null}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={pending || loggedIn === null}
      onClick={() =>
        start(async () => {
          const result = await toggleBookmarkAction(articleId);
          if (result && "bookmarked" in result && typeof result.bookmarked === "boolean") {
            setSaved(result.bookmarked);
          }
        })
      }
      className={className}
      title={label}
      aria-label={label}
    >
      {icon}
      {showLabel ? label : null}
    </button>
  );
}
