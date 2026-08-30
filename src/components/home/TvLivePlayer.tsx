"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  getChannelLive,
  youtubeLiveEmbedUrl,
  type LiveSource,
} from "@/lib/tv-live";
import { cn } from "@/lib/utils";

function HlsPlayer({ url, title }: { url: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setError(false);

    let hls: Hls | null = null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.play().catch(() => {});
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setError(true);
      });
    } else {
      setError(true);
    }

    return () => {
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [url]);

  if (error) {
    return (
      <div className="flex aspect-video items-center justify-center bg-ink px-4 text-center text-sm text-white/70">
        Yayın şu an açılamadı. Biraz sonra yeniden deneyin.
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className="aspect-video h-full w-full bg-black object-contain"
      controls
      playsInline
      autoPlay
      muted
      title={title}
    />
  );
}

function YoutubePlayer({ channelId, title }: { channelId: string; title: string }) {
  return (
    <iframe
      title={title}
      src={youtubeLiveEmbedUrl(channelId)}
      className="aspect-video h-full w-full bg-black"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}

export function TvLivePlayer({
  channelSlug,
  channelName,
  programTitle,
  className,
}: {
  channelSlug: string;
  channelName: string;
  programTitle?: string | null;
  className?: string;
}) {
  const source: LiveSource | null = getChannelLive(channelSlug);
  const label = programTitle
    ? `${channelName} — ${programTitle}`
    : `${channelName} canlı yayın`;

  if (!source) {
    return (
      <div
        className={cn(
          "flex aspect-video flex-col items-center justify-center gap-2 border border-border bg-surface px-6 text-center",
          className,
        )}
      >
        <p className="text-sm font-bold text-ink">{channelName}</p>
        <p className="max-w-sm text-xs leading-relaxed text-ink-soft">
          Bu kanal için canlı izleme henüz tanımlı değil. Program listesini aşağıdan takip
          edebilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden border border-border bg-black", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-ink px-3 py-2 text-white">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-brand px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />
              Canlı
            </span>
            <span className="truncate text-xs font-bold text-white/80">{channelName}</span>
          </div>
          {programTitle ? (
            <p className="mt-0.5 truncate text-[11px] text-white/55">{programTitle}</p>
          ) : null}
        </div>
      </div>
      {source.type === "hls" ? (
        <HlsPlayer url={source.url} title={label} />
      ) : (
        <YoutubePlayer channelId={source.channelId} title={label} />
      )}
    </div>
  );
}
