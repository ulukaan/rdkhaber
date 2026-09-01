"use client";

import { useTransition } from "react";
import { togglePollActiveAction } from "@/actions/poll";
import { cn } from "@/lib/utils";

export function PollActiveToggle({
  pollId,
  active,
  open,
}: {
  pollId: string;
  active: boolean;
  open: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => void togglePollActiveAction(pollId, !active))}
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-bold transition-colors",
        open
          ? "bg-emerald-50 text-emerald-700"
          : "bg-surface text-ink-soft hover:bg-border/60",
      )}
    >
      {open ? "Yayında" : active ? "Süresi doldu" : "Kapalı"}
    </button>
  );
}
