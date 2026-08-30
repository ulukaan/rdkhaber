"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, Search } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EmptyState } from "@/components/admin/PanelUI";
import { deleteMediaAction } from "@/actions/media";
import { Input } from "@/components/ui/FormField";
import { formatDate } from "@/lib/utils";

export type MediaItem = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  uploadedByName: string | null;
};

export function MediaGrid({ items }: { items: MediaItem[] }) {
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr");
    if (!q) return items;
    return items.filter((m) => m.filename.toLocaleLowerCase("tr").includes(q));
  }, [items, query]);

  async function copy(item: MediaItem) {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId((id) => (id === item.id ? null : id)), 1500);
    } catch {
      // Pano izni yoksa sessizce geç.
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Henüz medya yok"
        description="Haber veya galeri formundan görsel yüklediğinizde burada listelenir."
      />
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Dosya adında ara..."
            className="pl-9"
            aria-label="Medya ara"
          />
        </div>
        <p className="text-xs font-semibold text-ink-soft">
          {filtered.length} / {items.length} dosya
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-white px-6 py-12 text-center text-sm text-ink-soft">
          “{query}” ile eşleşen dosya yok.
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((m) => {
            const isImage = m.mimeType.startsWith("image/");
            return (
              <li
                key={m.id}
                className="group overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface">
                  {isImage ? (
                    // Yüklenen dosyalar yerel; boyut bilinmediği için düz img kullanılıyor.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.url}
                      alt={m.filename}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileText className="h-8 w-8 text-ink-soft" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-ink/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => copy(m)}
                      title="Bağlantıyı kopyala"
                      aria-label={`${m.filename} bağlantısını kopyala`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink shadow hover:text-brand"
                    >
                      {copiedId === m.id ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <span className="flex h-8 items-center rounded-lg bg-white px-1 shadow">
                      <DeleteButton id={m.id} action={deleteMediaAction} />
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <p className="truncate text-xs font-semibold text-ink" title={m.filename}>
                    {m.filename}
                  </p>
                  <p className="mt-1 flex items-center justify-between text-[11px] text-ink-soft">
                    <span>{formatSize(m.size)}</span>
                    <span>{formatDate(m.createdAt)}</span>
                  </p>
                  {m.uploadedByName ? (
                    <p className="mt-0.5 truncate text-[11px] text-ink-soft">{m.uploadedByName}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
