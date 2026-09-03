"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Pause, Square, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "playing" | "paused" | "error";

const SILENT_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

let stopGlobalPlayback: (() => void) | null = null;
let sharedCtx: AudioContext | null = null;

function getAudioContext() {
  const Ctor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedCtx || sharedCtx.state === "closed") sharedCtx = new Ctor();
  return sharedCtx;
}

function splitLong(part: string, max: number) {
  if (part.length <= max) return [part];
  const out: string[] = [];
  let rest = part;
  while (rest.length > max) {
    let cut = rest.lastIndexOf(" ", max);
    if (cut < 40) cut = max;
    out.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) out.push(rest);
  return out;
}

function chunkText(text: string, max = 900) {
  const parts = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?…])\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let buf = "";
  for (const part of parts) {
    for (const piece of splitLong(part, max)) {
      if (!buf) {
        buf = piece;
        continue;
      }
      if (`${buf} ${piece}`.length > max) {
        chunks.push(buf);
        buf = piece;
      } else {
        buf = `${buf} ${piece}`;
      }
    }
  }
  if (buf) chunks.push(buf);
  return chunks.length ? chunks : [text.trim()].filter(Boolean);
}

function mpegBlob(blob: Blob) {
  if (blob.type.includes("mpeg") || blob.type.includes("mp3")) return blob;
  return new Blob([blob], { type: "audio/mpeg" });
}

export function ArticleListenButton({ text }: { text: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const generationRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  function revokeUrl() {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  function releaseAll() {
    abortRef.current?.abort();
    abortRef.current = null;
    try {
      sourceRef.current?.stop();
    } catch {
      /* already stopped */
    }
    sourceRef.current = null;
    revokeUrl();
  }

  function stop() {
    generationRef.current += 1;
    if (stopGlobalPlayback === stop) stopGlobalPlayback = null;
    releaseAll();
    setStatus("idle");
  }

  useEffect(() => {
    return () => {
      generationRef.current += 1;
      if (stopGlobalPlayback === stop) stopGlobalPlayback = null;
      releaseAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount only
  }, []);

  if (!text.trim()) return null;

  function pause() {
    if (sourceRef.current) {
      void sharedCtx?.suspend();
    } else {
      audioRef.current?.pause();
    }
    setStatus("paused");
  }

  function resume() {
    if (sourceRef.current) {
      void sharedCtx?.resume();
    } else {
      void audioRef.current?.play();
    }
    setStatus("playing");
  }

  function unlockForMobile(audio: HTMLAudioElement) {
    audio.setAttribute("playsinline", "true");
    audio.setAttribute("webkit-playsinline", "true");
    audio.preload = "auto";
    audio.muted = false;
    audio.currentTime = 0;
    audio.src = SILENT_WAV;
    void audio.play().catch(() => undefined);
    const ctx = getAudioContext();
    void ctx?.resume();
  }

  async function fetchChunk(chunk: string, signal: AbortSignal) {
    const res = await fetch("/api/tts", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text: chunk }),
      signal,
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (res.status === 401) throw new Error("Dinlemek için giriş yapın");
      throw new Error(data?.error || "Ses alınamadı");
    }
    return mpegBlob(await res.blob());
  }

  function playWithElement(blob: Blob, signal: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
      const audio = audioRef.current;
      if (!audio) {
        reject(new Error("Ses oynatıcı yok"));
        return;
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      audio.pause();
      audio.src = url;
      audio.load();

      const onAbort = () => {
        cleanup();
        reject(new DOMException("Aborted", "AbortError"));
      };
      const cleanup = () => {
        audio.onended = null;
        audio.onerror = null;
        audio.onplaying = null;
        signal.removeEventListener("abort", onAbort);
      };
      signal.addEventListener("abort", onAbort);
      audio.onended = () => {
        cleanup();
        resolve();
      };
      audio.onerror = () => {
        cleanup();
        reject(new Error("Ses çalınamadı"));
      };
      const start = () => {
        const p = audio.play();
        if (p) {
          p.catch((err) => {
            cleanup();
            reject(err);
          });
        }
      };
      if (audio.readyState >= 2) start();
      else audio.oncanplaythrough = () => {
        audio.oncanplaythrough = null;
        start();
      };
    });
  }

  async function playWithContext(blob: Blob, signal: AbortSignal) {
    const ctx = getAudioContext();
    if (!ctx) throw new Error("Ses motoru yok");
    await ctx.resume();
    const raw = await blob.arrayBuffer();
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const decoded = await ctx.decodeAudioData(raw.slice(0));
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    await new Promise<void>((resolve, reject) => {
      const source = ctx.createBufferSource();
      source.buffer = decoded;
      source.connect(ctx.destination);
      sourceRef.current = source;
      const onAbort = () => {
        try {
          source.stop();
        } catch {
          /* ignore */
        }
        reject(new DOMException("Aborted", "AbortError"));
      };
      signal.addEventListener("abort", onAbort);
      source.onended = () => {
        signal.removeEventListener("abort", onAbort);
        if (sourceRef.current === source) sourceRef.current = null;
        resolve();
      };
      source.start(0);
    });
  }

  async function playBlob(blob: Blob, signal: AbortSignal) {
    try {
      await playWithElement(blob, signal);
    } catch (err) {
      if (signal.aborted) throw err;
      await playWithContext(blob, signal);
    }
  }

  async function play() {
    const chunks = chunkText(text);
    if (chunks.length === 0) return;

    stopGlobalPlayback?.();
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    stopGlobalPlayback = stop;
    setError(null);
    setStatus("loading");

    const audio = audioRef.current;
    if (!audio) {
      setError("Ses oynatıcı yok");
      setStatus("error");
      return;
    }
    unlockForMobile(audio);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const stopIfStale = () => generationRef.current !== generation;

    try {
      for (let i = 0; i < chunks.length; i += 1) {
        if (stopIfStale()) return;
        const blob = await fetchChunk(chunks[i], ac.signal);
        if (stopIfStale()) return;
        setStatus("playing");
        await playBlob(blob, ac.signal);
      }
      if (!stopIfStale()) {
        if (stopGlobalPlayback === stop) stopGlobalPlayback = null;
        setStatus("idle");
      }
    } catch (err) {
      if (stopIfStale()) return;
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (stopGlobalPlayback === stop) stopGlobalPlayback = null;
      releaseAll();
      const message = err instanceof Error ? err.message : "Ses üretilemedi";
      setError(message);
      setStatus("error");
      window.setTimeout(() => {
        setStatus((prev) => (prev === "error" ? "idle" : prev));
      }, 4000);
    }
  }

  const busy = status === "playing" || status === "paused" || status === "loading";

  return (
    <div className="relative flex items-center gap-1">
      <audio
        ref={audioRef}
        playsInline
        preload="auto"
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
        aria-hidden
      />
      {status === "playing" ? (
        <button
          type="button"
          onClick={pause}
          className="inline-flex h-10 min-w-[4.5rem] items-center justify-center gap-1.5 rounded-sm border border-brand bg-brand px-3 text-[12px] font-bold text-white sm:h-8 sm:min-w-0 sm:px-2.5"
          title="Duraklat"
          aria-label="Sesli okumayı duraklat"
        >
          <Pause className="h-3.5 w-3.5" aria-hidden />
          Duraklat
        </button>
      ) : (
        <button
          type="button"
          onClick={status === "paused" ? resume : () => void play()}
          disabled={status === "loading"}
          className={cn(
            "inline-flex h-10 min-w-[4.5rem] items-center justify-center gap-1.5 rounded-sm border px-3 text-[12px] font-bold transition-colors sm:h-8 sm:min-w-0 sm:px-2.5",
            busy
              ? "border-brand bg-brand/10 text-brand"
              : "border-border bg-white text-ink hover:border-brand hover:text-brand",
            status === "error" && "border-brand text-brand",
          )}
          title={error || (status === "loading" ? "Ses hazırlanıyor" : "Haberi sesli oku")}
          aria-label={
            status === "paused"
              ? "Sesli okumaya devam et"
              : status === "loading"
                ? "Ses hazırlanıyor"
                : error || "Haberi sesli oku"
          }
        >
          {status === "loading" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Volume2 className="h-3.5 w-3.5" aria-hidden />
          )}
          {status === "paused"
            ? "Devam"
            : status === "loading"
              ? "Hazırlanıyor"
              : status === "error"
                ? "Tekrar dene"
                : "Dinle"}
        </button>
      )}
      {busy ? (
        <button
          type="button"
          onClick={stop}
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-white text-ink hover:border-brand hover:text-brand sm:h-8 sm:w-8"
          title="Durdur"
          aria-label="Sesli okumayı durdur"
        >
          <Square className="h-3 w-3 fill-current" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
