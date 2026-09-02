"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Check, MoreHorizontal } from "lucide-react";
import { castPollVoteAction, getPollStateAction } from "@/actions/poll-vote";
import { emptyPollState, type PollState } from "@/lib/polls";
import { cn } from "@/lib/utils";

function formatCount(n: number) {
  if (n < 1000) return String(n);
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(".0", "")}B`;
  return `${Math.round(n / 1000)}B`;
}

/** Kırmızı → lacivert, yumuşak ara tonlarla */
const GRADIENT =
  "linear-gradient(105deg, #d6454a 0%, #c23a55 22%, #9a3a6e 45%, #5c3d8a 68%, #35407a 85%, #2a3a6e 100%)";

function PollHeader() {
  return (
    <div className="flex items-center gap-2.5">
      <p className="shrink-0 text-[15px] font-bold leading-none text-white">Anket</p>
      <span className="h-px min-w-0 flex-1 bg-white/70" aria-hidden />
      <MoreHorizontal className="h-4 w-4 shrink-0 text-white" strokeWidth={2.5} aria-hidden />
    </div>
  );
}

function PollOptionCard({
  option,
  selected,
  reveal,
  disabled,
  onVote,
}: {
  option: PollState["options"][number];
  selected: boolean;
  reveal: boolean;
  disabled: boolean;
  onVote: () => void;
}) {
  const hasImage = Boolean(option.imageUrl);

  if (hasImage) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onVote}
        aria-pressed={selected}
        className={cn(
          "group relative overflow-hidden border text-left transition-all",
          selected ? "border-white ring-2 ring-white/35" : "border-white/40 hover:border-white/75",
          disabled && !selected
            ? "cursor-default opacity-90"
            : "active:scale-[0.99] motion-reduce:transform-none",
        )}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/20">
          <Image
            src={option.imageUrl!}
            alt={option.label}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
            sizes="(max-width: 640px) 50vw, 240px"
            unoptimized
          />
          {reveal ? (
            <span className="absolute inset-x-0 bottom-0 h-1.5 bg-white/25" aria-hidden>
              <span
                className="block h-full bg-white transition-[width] duration-300"
                style={{ width: `${option.percent}%` }}
              />
            </span>
          ) : null}
        </div>
        <div className="space-y-1 px-2.5 py-2">
          <p className="text-sm font-semibold leading-snug text-white">{option.label}</p>
          {reveal ? (
            <p className="text-xs font-bold tabular-nums text-white/90">{option.percent}%</p>
          ) : null}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onVote}
      aria-pressed={selected}
      className={cn(
        "relative w-full overflow-hidden text-left transition-colors",
        selected
          ? "border border-white bg-white/15"
          : "border border-white/50 bg-transparent hover:bg-white/10",
        disabled && !selected
          ? "cursor-default opacity-90"
          : "active:scale-[0.99] motion-reduce:transform-none",
      )}
    >
      {reveal ? (
        <span
          className={cn(
            "absolute inset-y-0 left-0 bg-white/20 transition-[width] duration-300 motion-reduce:transition-none",
            selected && "bg-white/30",
          )}
          style={{ width: `${option.percent}%` }}
          aria-hidden
        />
      ) : null}
      <span className="relative flex min-h-[44px] items-center justify-between gap-3 px-3 py-2.5">
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
              selected ? "border-white bg-white text-[#1a2460]" : "border-white/70 bg-transparent",
            )}
            aria-hidden
          >
            {selected ? <Check className="h-3 w-3" /> : null}
          </span>
          <span className="text-sm font-semibold text-white">{option.label}</span>
        </span>
        {reveal ? (
          <span className="shrink-0 text-sm font-bold tabular-nums text-white">{option.percent}%</span>
        ) : null}
      </span>
    </button>
  );
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
  const [joined, setJoined] = useState(false);
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
  const imageGrid = state.hasImages;
  /** Compact sidebar: mockup teaser önce; katılınca seçenek/sonuç */
  const showTeaser = compact && !joined;

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
    <section aria-labelledby={headingId}>
      <div className="overflow-hidden text-white" style={{ background: GRADIENT }}>
        {showTeaser ? (
          <div className="flex min-h-[220px] flex-col px-4 pb-4 pt-3.5 sm:px-5">
            <PollHeader />

            <div className="mt-4 flex min-h-0 flex-1 flex-col border-t border-white/35 pt-5">
              <h3
                id={headingId}
                className="flex-1 text-[1.375rem] font-extrabold leading-[1.25] tracking-tight text-white"
              >
                {state.question}
              </h3>

              <div className="mt-5 border-t border-white/35 pt-4">
                <button
                  type="button"
                  onClick={() => setJoined(true)}
                  className="rounded-md border border-white bg-transparent px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-white hover:text-[#1a2460]"
                >
                  Ankete Katıl
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 pt-3.5 sm:px-5">
              <PollHeader />
            </div>

            {state.coverImageUrl ? (
              <div className="relative mx-4 mt-3 aspect-[21/9] overflow-hidden border border-white/25 bg-black/20 sm:mx-5">
                <Image
                  src={state.coverImageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 720px"
                  unoptimized
                  aria-hidden
                />
              </div>
            ) : null}

            <div className="mx-4 mt-4 border-t border-white/35 pt-4 sm:mx-5">
              <h3
                id={headingId}
                className="text-[1.2rem] font-extrabold leading-snug tracking-tight text-white sm:text-[1.3rem]"
              >
                {state.question}
              </h3>
              {state.description ? (
                <p className="mt-1.5 text-sm text-white/80">{state.description}</p>
              ) : null}
              <p className="mt-2 text-xs font-medium text-white/70">
                {state.closed
                  ? "Anket sona erdi"
                  : voted
                    ? "Oyunuz kaydedildi"
                    : "Bir seçenek işaretleyin"}
                {reveal ? ` · ${formatCount(state.totalVotes)} oy` : ""}
              </p>
            </div>

            <div
              className={cn(
                "mx-4 border-t border-white/35 px-0 py-4 sm:mx-5",
                imageGrid ? "grid grid-cols-2 gap-3" : "space-y-2",
              )}
            >
              {state.options.map((option) => (
                <PollOptionCard
                  key={option.id}
                  option={option}
                  selected={state.mine === option.id}
                  reveal={reveal}
                  disabled={disabled}
                  onVote={() => vote(option.id)}
                />
              ))}
            </div>

            {error ? (
              <p className="px-4 pb-4 text-sm font-medium text-white sm:px-5" role="alert">
                {error}
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
