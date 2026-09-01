"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { BarChart3, Check } from "lucide-react";
import { castPollVoteAction, getPollStateAction } from "@/actions/poll-vote";
import { emptyPollState, type PollState } from "@/lib/polls";
import { cn } from "@/lib/utils";

function formatCount(n: number) {
  if (n < 1000) return String(n);
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(".0", "")}B`;
  return `${Math.round(n / 1000)}B`;
}

export function PollWidget({
  pollId,
  initial,
  compact = false,
}: {
  pollId: string;
  initial?: PollState;
  compact?: boolean;
}) {
  const headingId = useId();
  const [state, setState] = useState<PollState>(initial ?? emptyPollState());
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const loadGen = useRef(0);

  useEffect(() => {
    const gen = ++loadGen.current;
    getPollStateAction(pollId)
      .then((next) => {
        if (gen === loadGen.current && next.id) setState(next);
      })
      .catch(() => {});
  }, [pollId]);

  if (!state.id && !initial?.id) return null;

  const voted = Boolean(state.mine);
  const reveal = state.showResults || voted || state.closed;
  const disabled = pending || state.closed;

  function vote(optionId: string) {
    if (disabled || state.mine === optionId) return;
    setError(null);
    const previous = state;
    start(async () => {
      const result = await castPollVoteAction(pollId, optionId);
      if (result && "error" in result) {
        setError(result.error);
        setState(previous);
        return;
      }
      if (result) setState(result);
    });
  }

  return (
    <section
      className={cn(
        "overflow-hidden border border-border bg-card",
        compact ? "rounded-2xl" : "rounded-none",
      )}
      aria-labelledby={headingId}
    >
      <div className="border-b border-border/70 px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <BarChart3 className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 id={headingId} className="text-base font-bold tracking-tight text-ink sm:text-lg">
              {state.question}
            </h2>
            {state.description ? (
              <p className="mt-1 text-sm text-ink-soft">{state.description}</p>
            ) : null}
            <p className="mt-2 text-xs font-medium text-ink-soft">
              {state.closed
                ? "Anket sona erdi"
                : voted
                  ? "Oyunuz kaydedildi"
                  : "Bir seçenek işaretleyin"}
              {reveal ? ` · ${formatCount(state.totalVotes)} oy` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 px-4 py-4 sm:px-5">
        {state.options.map((option) => {
          const selected = state.mine === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => vote(option.id)}
              aria-pressed={selected}
              className={cn(
                "relative w-full overflow-hidden rounded-xl border text-left transition-colors",
                selected
                  ? "border-brand bg-brand/5"
                  : "border-border bg-surface/60 hover:border-brand/30 hover:bg-surface",
                disabled && !selected ? "cursor-default opacity-90" : "active:scale-[0.99] motion-reduce:transform-none",
              )}
            >
              {reveal ? (
                <span
                  className={cn(
                    "absolute inset-y-0 left-0 bg-brand/10 transition-[width] duration-300 motion-reduce:transition-none",
                    selected && "bg-brand/15",
                  )}
                  style={{ width: `${option.percent}%` }}
                  aria-hidden
                />
              ) : null}
              <span className="relative flex min-h-[48px] items-center justify-between gap-3 px-4 py-3">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      selected ? "border-brand bg-brand text-white" : "border-border bg-card",
                    )}
                    aria-hidden
                  >
                    {selected ? <Check className="h-3 w-3" /> : null}
                  </span>
                  <span className="text-sm font-semibold text-ink">{option.label}</span>
                </span>
                {reveal ? (
                  <span className="shrink-0 text-sm font-bold tabular-nums text-ink">
                    {option.percent}%
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="px-4 pb-4 text-sm font-medium text-brand sm:px-5" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
