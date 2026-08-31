"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { UserPlus, UserCheck } from "lucide-react";
import { getAuthorFollowState, toggleFollowAction } from "@/actions/library";
import { cn } from "@/lib/utils";

export function FollowAuthorButton({
  authorId,
  loginHref = "/giris",
}: {
  authorId: string;
  loginHref?: string;
}) {
  const [state, setState] = useState<{
    loggedIn: boolean;
    following: boolean;
    self: boolean;
  } | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getAuthorFollowState(authorId).then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [authorId]);

  if (state?.self) return null;

  if (!state || !state.loggedIn) {
    return (
      <Link
        href={loginHref}
        className="inline-flex items-center gap-1.5 border border-brand bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-dark"
      >
        <UserPlus className="h-3.5 w-3.5" />
        Takip et
      </Link>
    );
  }

  const following = state?.following ?? false;

  return (
    <button
      type="button"
      disabled={pending || !state}
      onClick={() =>
        start(async () => {
          const result = await toggleFollowAction(authorId);
          if (result && "following" in result && typeof result.following === "boolean") {
            const following = result.following;
            setState((prev) => (prev ? { ...prev, following } : prev));
          }
        })
      }
      className={cn(
        "inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-bold transition-colors",
        following
          ? "border-border bg-white text-ink hover:border-brand hover:text-brand"
          : "border-brand bg-brand text-white hover:bg-brand-dark",
      )}
    >
      {following ? <UserCheck className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
      {following ? "Takipte" : "Takip et"}
    </button>
  );
}
