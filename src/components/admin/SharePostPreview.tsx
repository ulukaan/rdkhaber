"use client";

import { Download, Share2 } from "lucide-react";

export function SharePostPreview({
  slug,
  title,
}: {
  slug?: string;
  title?: string;
}) {
  if (!slug) {
    return (
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-ink">Instagram paylaşım kartı</h3>
        <p className="mt-1 text-xs text-ink-soft">
          Haberi bir kez kaydet; başlık, kategori, tarih ve fotoğraftan kart otomatik oluşur.
        </p>
      </div>
    );
  }

  const src = `/haber/${encodeURIComponent(slug)}/paylasim`;
  const downloadHref = `${src}?indir=1`;

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      <header className="border-b border-border px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
          <Share2 className="h-4 w-4" />
          Instagram paylaşım kartı
        </h3>
        <p className="mt-0.5 text-xs text-ink-soft">
          Yayınlayınca bu görsel hazır olur. İndirip Instagram, WhatsApp veya X’e basman yeter.
        </p>
      </header>
      <div className="p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={title ? `${title} paylaşım kartı` : "Paylaşım kartı"}
          className="mx-auto w-full max-w-[360px] rounded-md border border-border bg-surface object-cover"
        />
        <a
          href={downloadHref}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-ink/90"
        >
          <Download className="h-4 w-4" />
          PNG indir
        </a>
      </div>
    </div>
  );
}
