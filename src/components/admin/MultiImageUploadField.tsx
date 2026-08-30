"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { GripVertical, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/FormField";

export type GalleryImageItem = {
  url: string;
  caption: string;
};

export function MultiImageUploadField({
  name,
  defaultValue = [],
}: {
  name: string;
  defaultValue?: GalleryImageItem[];
}) {
  const [items, setItems] = useState<GalleryImageItem[]>(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const persist = (next: GalleryImageItem[]) => setItems(next);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: GalleryImageItem[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const json = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !json.url) throw new Error(json.error ?? "Yükleme başarısız");
        uploaded.push({ url: json.url, caption: "" });
      }
      persist([...items, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const addByUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    persist([...items, { url: trimmed, caption: "" }]);
  };

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      {items.length > 0 ? (
        <ul className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((item, index) => (
            <li key={`${item.url}-${index}`} className="overflow-hidden border border-border bg-surface">
              <div className="relative aspect-[4/3]">
                <Image src={item.url} alt="" fill className="object-cover" sizes="200px" unoptimized />
                <button
                  type="button"
                  onClick={() => persist(items.filter((_, i) => i !== index))}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center bg-black/60 text-white hover:bg-black/80"
                  aria-label="Görseli kaldır"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <span className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center bg-black/50 text-[10px] font-bold text-white">
                  {index + 1}
                </span>
              </div>
              <div className="p-2">
                <Input
                  placeholder="Açıklama (isteğe bağlı)"
                  value={item.caption}
                  onChange={(e) => {
                    const next = [...items];
                    next[index] = { ...item, caption: e.target.value };
                    persist(next);
                  }}
                  className="text-xs"
                />
                <div className="mt-1.5 flex gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => {
                      if (index === 0) return;
                      const next = [...items];
                      [next[index - 1], next[index]] = [next[index], next[index - 1]];
                      persist(next);
                    }}
                    className="inline-flex items-center gap-1 px-1.5 py-1 text-[10px] font-semibold text-ink-soft hover:text-brand disabled:opacity-30"
                  >
                    <GripVertical className="h-3 w-3" /> Yukarı
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => {
                      if (index >= items.length - 1) return;
                      const next = [...items];
                      [next[index + 1], next[index]] = [next[index], next[index + 1]];
                      persist(next);
                    }}
                    className="inline-flex items-center gap-1 px-1.5 py-1 text-[10px] font-semibold text-ink-soft hover:text-brand disabled:opacity-30"
                  >
                    Aşağı
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="mb-2 flex h-24 w-full flex-col items-center justify-center gap-1 border border-dashed border-border text-ink-soft hover:border-brand hover:text-brand"
      >
        <Upload className="h-5 w-5" />
        <span className="text-xs font-semibold">
          {uploading ? "Yükleniyor…" : "Birden fazla görsel seç"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <Input
        placeholder="veya görsel URL ekle (Enter)"
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          addByUrl((e.target as HTMLInputElement).value);
          (e.target as HTMLInputElement).value = "";
        }}
      />
      {error ? <p className="mt-1 text-xs font-medium text-brand">{error}</p> : null}
    </div>
  );
}
