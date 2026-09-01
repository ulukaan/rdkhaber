"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  Check,
  Copy,
  FileText,
  ImageOff,
  Loader2,
  Search,
  Trash2,
  Upload,
  Wand2,
} from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EmptyState } from "@/components/admin/PanelUI";
import {
  cleanupBrokenMediaAction,
  dedupeMediaAction,
  deleteMediaAction,
} from "@/actions/media";
import { Input } from "@/components/ui/FormField";
import { formatDate } from "@/lib/utils";

export type MediaItem = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  contentHash: string | null;
  createdAt: Date;
  uploadedByName: string | null;
};

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function MediaThumb({ url, alt }: { url: string; alt: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-surface text-ink-soft">
        <ImageOff className="h-7 w-7 opacity-60" />
        <span className="text-[10px] font-semibold">Dosya yok</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
    />
  );
}

export function MediaGrid({
  items,
  duplicateHashes,
  isAdmin,
}: {
  items: MediaItem[];
  duplicateHashes: Set<string>;
  isAdmin: boolean;
}) {
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

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

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setMessage(null);
    let uploaded = 0;
    let duplicates = 0;
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Yükleme başarısız");
        uploaded += 1;
        if (json.duplicate) duplicates += 1;
      }
      const parts = [`${uploaded} dosya işlendi`];
      if (duplicates) parts.push(`${duplicates} kopya atlandı`);
      setMessage(parts.join(" · "));
      window.location.reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Yükleme başarısız");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function runCleanup(action: "broken" | "dedupe") {
    startTransition(async () => {
      setMessage(null);
      if (action === "broken") {
        const result = await cleanupBrokenMediaAction();
        setMessage(`${result.removed} eksik kayıt silindi.`);
      } else {
        const result = await dedupeMediaAction();
        const freed = (result.freedBytes / (1024 * 1024)).toFixed(1);
        setMessage(`${result.merged} kopya birleştirildi · ~${freed} MB kazanıldı.`);
      }
      window.location.reload();
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center">
        <EmptyState
          title="Henüz medya yok"
          description="Görsel yüklediğinizde burada listelenir. Dosyalar WebP olarak sıkıştırılır; aynı görsel tekrar yüklenmez."
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Görsel yükle
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Dosya adında ara..."
              className="pl-9"
              aria-label="Medya ara"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading || pending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Yükle
            </button>
            {isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={() => runCleanup("dedupe")}
                  disabled={pending || uploading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-semibold text-ink hover:border-brand hover:text-brand disabled:opacity-60"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  Kopyaları temizle
                </button>
                <button
                  type="button"
                  onClick={() => runCleanup("broken")}
                  disabled={pending || uploading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-semibold text-ink hover:border-brand hover:text-brand disabled:opacity-60"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eksikleri sil
                </button>
              </>
            ) : null}
            <span className="text-xs font-semibold text-ink-soft">
              {filtered.length} / {items.length}
            </span>
          </div>
        </div>
        {message ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800">
            {message}
          </p>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-white px-6 py-12 text-center text-sm text-ink-soft">
          “{query}” ile eşleşen dosya yok.
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filtered.map((m) => {
            const isImage = m.mimeType.startsWith("image/");
            const isDuplicate = m.contentHash ? duplicateHashes.has(m.contentHash) : false;
            return (
              <li
                key={m.id}
                className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:border-brand/30 hover:shadow-md"
              >
                <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#f8f9fb_0%,#eef1f5_100%)]">
                  {isImage ? (
                    <MediaThumb url={m.url} alt={m.filename} />
                  ) : (
                    <FileText className="h-8 w-8 text-ink-soft" />
                  )}
                  {isDuplicate ? (
                    <span className="absolute top-2 left-2 rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Kopya
                    </span>
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-ink/75 via-ink/35 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
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
                    {isAdmin ? (
                      <span className="flex h-8 items-center rounded-lg bg-white px-1 shadow">
                        <DeleteButton id={m.id} action={deleteMediaAction} />
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-1 p-3">
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-ink" title={m.filename}>
                    {m.filename}
                  </p>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-ink-soft">
                    <span className="rounded-md bg-surface px-1.5 py-0.5 font-semibold">{formatSize(m.size)}</span>
                    <span className="truncate">{formatDate(m.createdAt)}</span>
                  </div>
                  {m.uploadedByName ? (
                    <p className="truncate text-[11px] text-ink-soft">{m.uploadedByName}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => uploadFiles(e.target.files)}
      />
    </>
  );
}
