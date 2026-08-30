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

function ActionTile({
  href,
  label,
  Icon,
  external,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-center transition-colors hover:border-brand/40 hover:bg-white"
    >
      <Icon className="h-5 w-5 text-ink-soft" />
      <span className="text-[11px] font-bold leading-tight text-ink">{label}</span>
    </Link>
  );
}

export function ArticleSuccessActions({
  basePath,
  articleId,
  slug,
  title,
  shareUrl,
  canView,
}: {
  basePath: string;
  articleId: string;
  slug: string;
  title: string;
  shareUrl: string;
  canView: boolean;
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
    <div className="space-y-4 border-t border-border px-5 py-5 sm:px-8">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={shareNative}
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-bold text-ink transition-colors hover:border-brand/40 hover:bg-white"
        >
          <Share2 className="h-4 w-4" />
          Haberi Paylaş
        </button>
        <ShareButtons url={shareUrl} title={title} size="sm" />
        {shareMsg ? <span className="text-xs font-medium text-ink-soft">{shareMsg}</span> : null}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <ActionTile
          href={`${basePath}/${articleId}`}
          label="Haberi Düzenle"
          Icon={Pencil}
        />
        <ActionTile
          href={`${basePath}/${articleId}#galeri`}
          label="Haber Galerisi"
          Icon={Images}
        />
        {canView ? (
          <ActionTile
            href={`/haber/${slug}`}
            label="Haberi Görüntüle"
            Icon={ExternalLink}
            external
          />
        ) : (
          <div className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface/50 px-3 py-3 text-center opacity-60">
            <ExternalLink className="h-5 w-5 text-ink-soft" />
            <span className="text-[11px] font-bold leading-tight text-ink-soft">Henüz yayında değil</span>
          </div>
        )}
        <ActionTile href={`${basePath}/yeni`} label="Yeni Haber Ekle" Icon={Plus} />
        <ActionTile href={basePath} label="Tüm Haberler" Icon={LayoutGrid} />
        <button
          type="button"
          onClick={refreshCache}
          disabled={pending}
          className={cn(
            "flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-center transition-colors hover:border-brand/40 hover:bg-white disabled:opacity-60",
          )}
        >
          <RefreshCw className={cn("h-5 w-5 text-ink-soft", pending && "animate-spin")} />
          <span className="text-[11px] font-bold leading-tight text-ink">
            {pending ? "Yenileniyor..." : cacheMsg ?? "Önbelleği Yenile"}
          </span>
        </button>
      </div>
    </div>
  );
}
