"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader2, Pause, Square, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "playing" | "paused" | "error";

const TTS_EVENT = "rdk-article-tts";

const SILENT_WAV =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";

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

export function ArticleListenButton({ text }: { text: string }) {
  const instanceId = useId();
  const [status, setStatus] = useState<Status>("idle");
  const ownerRef = useRef(false);
  const generationRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function revokeUrl() {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  function releaseAll() {
    abortRef.current?.abort();
    abortRef.current = null;
    revokeUrl();
  }

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onOtherStart = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (id === instanceId) return;
      ownerRef.current = false;
      generationRef.current += 1;
      releaseAll();
      setStatus("idle");
    };
    window.addEventListener(TTS_EVENT, onOtherStart);

    return () => {
      window.removeEventListener(TTS_EVENT, onOtherStart);
      generationRef.current += 1;
      ownerRef.current = false;
      releaseAll();
    };
  }, [instanceId]);

  if (!text.trim()) return null;

  function stop() {
    generationRef.current += 1;
    ownerRef.current = false;
    releaseAll();
    setStatus("idle");
  }

  function pause() {
    audioRef.current?.pause();
    setStatus("paused");
  }

  function resume() {
    void audioRef.current?.play();
    setStatus("playing");
  }

  async function fetchChunk(chunk: string, signal: AbortSignal) {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: chunk }),
      signal,
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error || "Ses alınamadı");
    }
    return await res.blob();
  }

  function playBlob(blob: Blob, signal: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
      const audio = audioRef.current;
      if (!audio) {
        reject(new Error("Ses oynatıcı yok"));
        return;
      }
      revokeUrl();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      audio.src = url;

      const onAbort = () => {
        cleanup();
        reject(new DOMException("Aborted", "AbortError"));
      };
      const cleanup = () => {
        audio.onended = null;
        audio.onerror = null;
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
      void audio.play().catch((err) => {
        cleanup();
        reject(err);
      });
    });
  }

  async function play() {
    const chunks = chunkText(text);
    if (chunks.length === 0) return;

    const generation = generationRef.current + 1;
    generationRef.current = generation;
    ownerRef.current = true;
    window.dispatchEvent(new CustomEvent(TTS_EVENT, { detail: instanceId }));
    setStatus("loading");

    const unlock = audioRef.current;
    if (unlock) {
      unlock.src = SILENT_WAV;
      await unlock.play().catch(() => undefined);
      unlock.pause();
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const stopIfStale = () => generationRef.current !== generation || !ownerRef.current;

    try {
      for (let i = 0; i < chunks.length; i += 1) {
        if (stopIfStale()) return;
        const blob = await fetchChunk(chunks[i], ac.signal);
        if (stopIfStale()) return;
        setStatus("playing");
        await playBlob(blob, ac.signal);
      }
      if (!stopIfStale()) {
        ownerRef.current = false;
        setStatus("idle");
      }
    } catch (err) {
      if (stopIfStale()) return;
      if (err instanceof DOMException && err.name === "AbortError") return;
      ownerRef.current = false;
      revokeUrl();
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 2500);
    }
  }

  const busy = status === "playing" || status === "paused" || status === "loading";

  return (
    <div className="flex items-center gap-1">
      {status === "playing" ? (
        <button
          type="button"
          onClick={pause}
          className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-brand bg-brand px-2.5 text-[12px] font-bold text-white"
          title="Duraklat"
          aria-label="Sesli okumayı duraklat"
        >
          <Pause className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">Duraklat</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={status === "paused" ? resume : play}
          disabled={status === "loading"}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-sm border px-2.5 text-[12px] font-bold transition-colors",
            busy
              ? "border-brand bg-brand/10 text-brand"
              : "border-border bg-white text-ink hover:border-brand hover:text-brand",
            status === "error" && "border-brand text-brand",
          )}
          title={status === "loading" ? "Ses hazırlanıyor" : "Haberi sesli oku"}
          aria-label={
            status === "paused"
              ? "Sesli okumaya devam et"
              : status === "loading"
                ? "Ses hazırlanıyor"
                : "Haberi sesli oku"
          }
        >
          {status === "loading" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Volume2 className="h-3.5 w-3.5" aria-hidden />
          )}
          <span className="hidden sm:inline">
            {status === "paused" ? "Devam" : status === "loading" ? "Hazırlanıyor" : status === "error" ? "Tekrar dene" : "Dinle"}
          </span>
        </button>
      )}
      {busy ? (
        <button
          type="button"
          onClick={stop}
          className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-white text-ink hover:border-brand hover:text-brand"
          title="Durdur"
          aria-label="Sesli okumayı durdur"
        >
          <Square className="h-3 w-3 fill-current" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
