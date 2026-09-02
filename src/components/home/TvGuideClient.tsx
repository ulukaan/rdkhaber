"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { statusForRange, type ChannelSchedule } from "@/lib/broadcast";
import type { TvGuideDesign } from "@/lib/settings";
import { CoverImage } from "@/components/news/CoverImage";
import { TvLivePlayer } from "@/components/home/TvLivePlayer";
import { getChannelLive } from "@/lib/tv-live";
import { cn } from "@/lib/utils";

function formatDateTr(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatClockRange(startMin: number, endMin: number) {
  const fmt = (m: number) => {
    const n = ((m % 1440) + 1440) % 1440;
    return `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  };
  return `${fmt(startMin)} – ${fmt(endMin)}`;
}

export function TvGuideClient({
  schedules,
  initialSlug,
  design = "1",
  title = "Yayın Akışı",
  intro = "",
}: {
  schedules: ChannelSchedule[];
  initialSlug?: string;
  design?: TvGuideDesign;
  title?: string;
  intro?: string;
}) {
  const firstSlug = schedules[0]?.channel.slug ?? "";
  const [slug, setSlug] = useState(
    schedules.some((s) => s.channel.slug === initialSlug) ? initialSlug! : firstSlug,
  );
  const [, setTick] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const active = useMemo(
    () => schedules.find((s) => s.channel.slug === slug) ?? schedules[0],
    [schedules, slug],
  );

  const liveCount = useMemo(() => {
    return schedules.reduce((n, s) => {
      const hasLive = s.programs.some(
        (p) => statusForRange(p.startMin, p.endMin, undefined, s.date) === "CANLI",
      );
      return n + (hasLive ? 1 : 0);
    }, 0);
  }, [schedules]);

  useEffect(() => {
    if (!active) return;
    const live = active.programs.find(
      (p) => statusForRange(p.startMin, p.endMin, undefined, active.date) === "CANLI",
    );
    if (!live) return;
    const el = document.getElementById(`tv-${active.channel.slug}-${live.time}`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [active]);

  if (!active) {
    return (
      <div className="border border-border bg-white px-4 py-10 text-center text-sm text-ink-soft">
        Yayın akışı şu an alınamadı. Biraz sonra yeniden deneyin.
      </div>
    );
  }

  const liveProgram = active.programs.find(
    (p) => statusForRange(p.startMin, p.endMin, undefined, active.date) === "CANLI",
  );
  const hasLiveWatch = Boolean(getChannelLive(active.channel.slug));

  return (
    <div className="space-y-4">
      <header className="relative overflow-hidden border border-border bg-ink text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 10% 20%, color-mix(in srgb, var(--brand, #d0021b) 55%, transparent), transparent 60%), linear-gradient(135deg, #1a1f28 0%, #0f1318 100%)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 px-4 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">TV Rehberi</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
            {intro ? <p className="mt-1.5 max-w-xl text-sm text-white/70">{intro}</p> : null}
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="border border-white/15 bg-white/5 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">Tarih</p>
              <p className="font-semibold capitalize">{formatDateTr(active.date)}</p>
            </div>
            <div className="border border-white/15 bg-white/5 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/50">Canlı kanal</p>
              <p className="font-extrabold tabular-nums text-white">{liveCount}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="border border-border bg-white">
        <div className="relative px-2 py-3 sm:px-4">
          <div className="flex gap-[15px] overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {schedules.map((s) => {
              const on = s.channel.slug === active.channel.slug;
              const isLive = s.programs.some(
                (p) => statusForRange(p.startMin, p.endMin, undefined, s.date) === "CANLI",
              );
              const watchable = Boolean(getChannelLive(s.channel.slug));
              const current = s.current;
              return (
                <button
                  key={s.channel.slug}
                  type="button"
                  onClick={() => setSlug(s.channel.slug)}
                  className={cn(
                    "group flex h-[120px] w-[103px] shrink-0 flex-col items-center rounded-md px-1 pt-2 transition-shadow",
                    on ? "bg-brand text-white shadow-md" : "bg-white text-ink hover:shadow-md",
                  )}
                  aria-pressed={on}
                  aria-label={`${s.channel.name}${watchable ? " — canlı izle" : ""}`}
                >
                  <span className="relative flex h-[72px] w-full items-center justify-center">
                    <span className="flex h-[54px] w-[54px] items-center justify-center bg-white">
                      <img
                        src={s.logoUrl}
                        alt=""
                        width={50}
                        height={50}
                        className="h-[46px] w-[46px] object-contain"
                      />
                    </span>
                    {isLive || watchable ? (
                      <span
                        className={cn(
                          "absolute right-0 top-0 px-1 py-0.5 text-[9px] font-extrabold uppercase tracking-wide",
                          on
                            ? "bg-white text-brand"
                            : isLive
                              ? "bg-brand text-white"
                              : "bg-emerald-700 text-white",
                        )}
                      >
                        {isLive ? "Canlı" : "İzle"}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "mt-1 line-clamp-1 w-full px-0.5 text-center text-[13px] font-semibold leading-tight",
                      on ? "text-white" : "text-ink",
                    )}
                  >
                    {s.channel.name}
                  </span>
                  {current ? (
                    <span
                      className={cn(
                        "mt-0.5 line-clamp-1 w-full px-0.5 text-center text-[10px] font-medium tabular-nums",
                        on ? "text-white/75" : "text-ink-soft",
                      )}
                    >
                      {current.time} {current.title}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <TvLivePlayer
        key={active.channel.slug}
        channelSlug={active.channel.slug}
        channelName={active.channel.name}
        programTitle={liveProgram?.title ?? active.current?.title}
      />

      {liveProgram && !hasLiveWatch ? (
        <div className="grid gap-0 border border-border bg-white sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <CoverImage
            src={liveProgram.imageUrl}
            alt={liveProgram.title}
            fallback="wash"
            className="aspect-[16/9] w-full sm:aspect-auto sm:min-h-[220px]"
            sizes="(max-width: 640px) 100vw, 50vw"
            priority
          />
          <div className="flex flex-col justify-center px-4 py-5 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-brand px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />
                Şimdi yayında
              </span>
              <span className="text-xs font-bold text-ink-soft">{active.channel.name}</span>
            </div>
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-brand">
              {formatClockRange(liveProgram.startMin, liveProgram.endMin)}
            </p>
            <h2 className="mt-1 text-xl font-extrabold leading-snug text-ink sm:text-2xl">
              {liveProgram.title}
            </h2>
          </div>
        </div>
      ) : null}

      <div className="border border-border bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-14 items-center justify-center border border-border bg-white px-1">
              <img
                src={active.logoUrl}
                alt=""
                width={56}
                height={28}
                className="h-6 w-auto max-w-[52px] object-contain"
              />
            </span>
            <div>
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink">
                {active.channel.name}
              </h2>
              <p className="text-[11px] capitalize text-ink-soft">{formatDateTr(active.date)}</p>
            </div>
          </div>
          <p className="text-[11px] font-semibold text-ink-soft">
            {active.programs.length} program
          </p>
        </div>

        <ul
          ref={listRef}
          className={cn(
            design === "2"
              ? "grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3"
              : "divide-y divide-border",
          )}
        >
          {active.programs.map((program) => {
            const status = statusForRange(program.startMin, program.endMin, undefined, active.date);
            const live = status === "CANLI";
            const id = `tv-${active.channel.slug}-${program.time}`;

            if (design === "2") {
              return (
                <li
                  key={id}
                  id={id}
                  className={cn(
                    "bg-white p-3 transition-colors",
                    live && "bg-brand/[0.04] ring-1 ring-inset ring-brand/40",
                  )}
                >
                  <CoverImage
                    src={program.imageUrl}
                    alt={program.title}
                    fallback="wash"
                    className="aspect-video w-full"
                    sizes="320px"
                  />
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-sm font-extrabold tabular-nums text-brand">{program.time}</span>
                    {live ? (
                      <span className="bg-brand px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                        Canlı
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm font-bold leading-snug text-ink">{program.title}</p>
                </li>
              );
            }

            return (
              <li
                key={id}
                id={id}
                className={cn(
                  "grid grid-cols-[64px_1fr] gap-3 px-4 py-3.5 transition-colors sm:grid-cols-[88px_140px_1fr] sm:gap-4 sm:px-5",
                  live && "bg-brand/[0.04]",
                )}
              >
                <div className="flex flex-col items-start pt-0.5">
                  <span
                    className={cn(
                      "text-base font-extrabold tabular-nums sm:text-lg",
                      live ? "text-brand" : "text-ink",
                    )}
                  >
                    {program.time}
                  </span>
                  {live ? (
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-brand">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" aria-hidden />
                      Canlı
                    </span>
                  ) : (
                    <span className="mt-1 text-[10px] font-semibold tabular-nums text-ink-soft">
                      {formatClockRange(program.startMin, program.endMin).split(" – ")[1]}
                    </span>
                  )}
                </div>
                <CoverImage
                  src={program.imageUrl}
                  alt={program.title}
                  fallback="wash"
                  className="hidden aspect-video w-full sm:block"
                  sizes="140px"
                />
                <div className="min-w-0 self-center">
                  <CoverImage
                    src={program.imageUrl}
                    alt={program.title}
                    fallback="wash"
                    className="mb-2 aspect-video w-full sm:hidden"
                    sizes="200px"
                  />
                  <p
                    className={cn(
                      "text-[15px] font-bold leading-snug text-ink sm:text-base",
                      live && "text-ink",
                    )}
                  >
                    {program.title}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-ink-soft">{active.channel.name}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
