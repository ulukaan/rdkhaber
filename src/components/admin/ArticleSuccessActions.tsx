"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Images,
  LayoutGrid,
  Pencil,
  Plus,
  RefreshCw,
  Share2,
} from "lucide-react";
import { ShareButtons } from "@/components/news/ShareButtons";
import { refreshArticleCacheAction } from "@/actions/article";
import { cn } from "@/lib/utils";

export function ArticleSuccessActions({
  basePath,
  articleId,
  slug,
  title,
  shareUrl,
  canView,
  accent,
}: {
  basePath: string;
  articleId: string;
  slug: string;
  title: string;
  shareUrl: string;
  canView: boolean;
  accent: string;
}) {
  const [pending, startTransition] = useTransition();
  const [cacheMsg, setCacheMsg] = useState<string | null>(null);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const shareNative = async () => {
    setShareMsg(null);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl, text: title });
        return;
      } catch {
        // kullanıcı iptal ettiyse sessiz kal
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareMsg("Bağlantı kopyalandı");
    } catch {
      setShareMsg("Bağlantıyı kopyalayamadık");
    }
  };

  const refreshCache = () => {
    setCacheMsg(null);
    startTransition(async () => {
      await refreshArticleCacheAction(slug);
      setCacheMsg("Önbellek yenilendi");
    });
  };

  return (
    <div className="space-y-5 border-t border-border px-5 py-5 sm:px-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link
          href={`${basePath}/${articleId}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: accent }}
        >
          <Pencil className="h-4 w-4" />
          Haberi düzenle
        </Link>
        {canView ? (
          <Link
            href={`/haber/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-bold text-ink transition-colors hover:bg-surface"
          >
            <ExternalLink className="h-4 w-4" />
            Sitede gör
          </Link>
        ) : (
          <span className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 text-sm font-semibold text-ink-soft">
            Henüz yayında değil
          </span>
        )}
        <Link
          href={`${basePath}/yeni`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-bold text-ink transition-colors hover:bg-surface"
        >
          <Plus className="h-4 w-4" />
          Yeni haber
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
        <Link
          href={`${basePath}/${articleId}#galeri`}
          className="inline-flex items-center gap-1.5 text-ink-soft transition-colors hover:text-ink"
        >
          <Images className="h-4 w-4" />
          Galeri
        </Link>
        <Link
          href={basePath}
          className="inline-flex items-center gap-1.5 text-ink-soft transition-colors hover:text-ink"
        >
          <LayoutGrid className="h-4 w-4" />
          Tüm haberler
        </Link>
        <button
          type="button"
          onClick={refreshCache}
          disabled={pending}
          className="inline-flex items-center gap-1.5 text-ink-soft transition-colors hover:text-ink disabled:opacity-60"
        >
          <RefreshCw className={cn("h-4 w-4", pending && "animate-spin")} />
          {pending ? "Yenileniyor..." : cacheMsg ?? "Önbelleği yenile"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <span className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">Paylaş</span>
        <button
          type="button"
          onClick={shareNative}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-bold text-ink transition-colors hover:bg-surface"
        >
          <Share2 className="h-3.5 w-3.5" />
          Bağlantı
        </button>
        <ShareButtons url={shareUrl} title={title} size="sm" />
        {shareMsg ? <span className="text-xs font-medium text-ink-soft">{shareMsg}</span> : null}
      </div>
    </div>
  );
}
