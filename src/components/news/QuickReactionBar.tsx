"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { getArticleReactionsAction, setArticleReactionAction } from "@/actions/reaction";
import { REACTION_TYPES, emptyReactionState, type ReactionId, type ReactionState } from "@/lib/reactions";
import { burstReaction } from "@/lib/reaction-burst";
import { cn } from "@/lib/utils";

function formatCount(n: number) {
  if (n <= 0) return "0";
  if (n < 1000) return String(n);
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(".0", "")}B`;
  return `${Math.round(n / 1000)}B`;
}

export function QuickReactionBar({
  articleId,
  initial,
}: {
  articleId: string;
  initial?: ReactionState;
}) {
  const headingId = useId();
  const [state, setState] = useState<ReactionState>(initial ?? emptyReactionState());
  const [pending, start] = useTransition();
  const [pop, setPop] = useState<{ id: ReactionId; n: number } | null>(null);
  const loadGen = useRef(0);

  useEffect(() => {
    const gen = ++loadGen.current;
    getArticleReactionsAction(articleId)
      .then((next) => {
        if (gen === loadGen.current) setState(next);
      })
      .catch(() => {});
  }, [articleId]);

  function pick(type: ReactionId, el: HTMLElement) {
    burstReaction(
      REACTION_TYPES.find((item) => item.id === type)?.emoji ?? "👍",
      type,
      el,
    );
    setPop((current) => ({ id: type, n: (current?.n ?? 0) + 1 }));
    loadGen.current += 1;
    const previous = state;
    setState((current) => {
      const counts = { ...current.counts };
      if (current.mine === type) {
        counts[type] = Math.max(0, counts[type] - 1);
        return { counts, mine: null };
      }
      if (current.mine) counts[current.mine] = Math.max(0, counts[current.mine] - 1);
      counts[type] += 1;
      return { counts, mine: type };
    });
    start(async () => {
      const result = await setArticleReactionAction(articleId, type);
      if (result && "error" in result) {
        setState(previous);
        return;
      }
      if (result) setState(result);
    });
  }

  return (
    <section className="mt-8 border border-border bg-white" aria-labelledby={headingId}>
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <h2 id={headingId} className="text-sm font-extrabold text-ink">
          Hızlı ifade
        </h2>
        <p className="mt-0.5 text-xs text-ink-soft">Bu habere ne diyorsunuz? Giriş gerekmez.</p>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-6">
        {REACTION_TYPES.map((item) => {
          const selected = state.mine === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={pending}
              onClick={(event) => pick(item.id, event.currentTarget)}
              aria-pressed={selected}
              className={cn(
                "flex min-h-[4.75rem] w-full flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-3 text-[11px] font-bold transition-transform transition-colors active:scale-95",
                selected
                  ? "bg-brand/10 text-brand ring-1 ring-brand/30"
                  : "bg-surface text-ink hover:bg-border/60",
              )}
            >
              <span
                key={pop?.id === item.id ? pop.n : 0}
                className={cn(
                  "text-xl leading-none",
                  pop?.id === item.id && "reaction-pop",
                )}
                aria-hidden
              >
                {item.emoji}
              </span>
              <span>{item.label}</span>
              <span className={cn("text-[10px] font-semibold", selected ? "text-brand" : "text-ink-soft")}>
                {formatCount(state.counts[item.id])}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
