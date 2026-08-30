"use client";

import { useState } from "react";
import { CoverImage } from "@/components/news/CoverImage";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export type ArticleGalleryImage = {
  id: string;
  imageUrl: string;
  caption: string | null;
};

export function ArticleImageGallery({
  images,
  color,
  title,
}: {
  images: ArticleGalleryImage[];
  color?: string | null;
  title: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  if (images.length === 0) return null;

  const current = active !== null ? images[active] : null;

  return (
    <section className="mt-3 border border-border bg-white" aria-label="Haber galerisi">
      <div className="border-b border-border bg-surface px-3 py-2">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">
          Galeri · {images.length} görsel
        </p>
      </div>
      <ul
        className={cn(
          "grid gap-px bg-border",
          images.length === 1 && "grid-cols-1",
          images.length === 2 && "grid-cols-2",
          images.length >= 3 && "grid-cols-2 sm:grid-cols-3",
        )}
      >
        {images.map((img, i) => (
          <li key={img.id} className="bg-white">
            <button
              type="button"
              onClick={() => setActive(i)}
              className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <CoverImage
                src={img.imageUrl}
                alt={img.caption || `${title} — görsel ${i + 1}`}
                color={color}
                className="aspect-[16/10] w-full"
                sizes="(max-width: 640px) 50vw, 280px"
                fallback="wash"
              />
              {img.caption ? (
                <p className="line-clamp-2 px-2.5 py-2 text-xs text-ink-soft group-hover:text-ink">
                  {img.caption}
                </p>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      {current ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Galeri görseli"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center bg-white text-ink"
            aria-label="Kapat"
            onClick={() => setActive(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-[85vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CoverImage
              src={current.imageUrl}
              alt={current.caption || title}
              color={color}
              className="aspect-[16/10] w-full bg-black"
              sizes="90vw"
            />
            {current.caption ? (
              <p className="mt-3 text-center text-sm text-white">{current.caption}</p>
            ) : null}
            {images.length > 1 ? (
              <div className="mt-4 flex justify-center gap-2">
                <button
                  type="button"
                  className="bg-white px-3 py-1.5 text-xs font-bold text-ink disabled:opacity-40"
                  disabled={active === 0}
                  onClick={() => setActive((v) => (v !== null && v > 0 ? v - 1 : v))}
                >
                  Önceki
                </button>
                <span className="self-center text-xs text-white/80">
                  {(active ?? 0) + 1} / {images.length}
                </span>
                <button
                  type="button"
                  className="bg-white px-3 py-1.5 text-xs font-bold text-ink disabled:opacity-40"
                  disabled={active === images.length - 1}
                  onClick={() =>
                    setActive((v) => (v !== null && v < images.length - 1 ? v + 1 : v))
                  }
                >
                  Sonraki
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
