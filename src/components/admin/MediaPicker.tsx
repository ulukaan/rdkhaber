"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff, Search, Upload, X } from "lucide-react";
import { listMediaAction } from "@/actions/media";
import { Input } from "@/components/ui/FormField";

type MediaRow = { id: string; url: string; filename: string };

/**
 * Medya kütüphanesinden görsel seçme modalı.
 * Hem kapak/konum görsellerinde hem de editörün görsel ekle düğmesinde kullanılır.
 */
export function MediaPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [items, setItems] = useState<MediaRow[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const rows = await listMediaAction(query.trim() || undefined);
        if (!cancelled) setItems(rows);
      } catch {
        if (!cancelled) setError("Medya listesi alınamadı.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, query ? 300 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Yükleme başarısız");
      onSelect(json.url);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Kapat"
        onClick={onClose}
        className="absolute inset-0 bg-ink/60"
      />
      <div className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-white shadow-2xl sm:max-h-[80vh] sm:max-w-3xl sm:rounded-xl">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-3 sm:gap-3 sm:px-5">
          <h3 className="text-sm font-bold text-ink">Medya Galerisi</h3>
          <div className="relative order-3 w-full sm:order-none sm:ml-auto sm:w-56">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Resim ara..."
              className="pl-9"
              aria-label="Görsel ara"
            />
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3 py-2.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50 sm:py-2"
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "Yükleniyor..." : "Yükle"}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-surface sm:ml-0 sm:h-8 sm:w-8"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-[200px] flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
          {error ? <p className="mb-3 text-sm font-medium text-brand">{error}</p> : null}
          {loading ? (
            <p className="py-10 text-center text-sm text-ink-soft">Yükleniyor...</p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-ink-soft">
              <ImageOff className="h-8 w-8" />
              <p className="text-sm">
                {query ? `“${query}” ile eşleşen görsel yok.` : "Kütüphanede henüz görsel yok."}
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {items.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(m.url);
                      onClose();
                    }}
                    title={m.filename}
                    className="group block w-full overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-brand"
                  >
                    <span className="block aspect-[4/3] overflow-hidden">
                      {/* Yerel yüklemeler; boyut bilinmediği için düz img. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.url}
                        alt={m.filename}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <span className="block truncate px-2 py-1.5 text-[11px] text-ink-soft group-hover:text-brand">
                      {m.filename}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />
      </div>
    </div>
  );
}
