"use client";

import { useRef, useState } from "react";
import { FileImage, Film, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { isImageAttachment, isVideoAttachment } from "@/lib/attachments";

export function AttachmentUploadField({
  value,
  onChange,
  maxFiles = 5,
  label = "Fotoğraf veya video ekle",
  hint = "JPG, PNG, WEBP, GIF (max 8 MB) · MP4, WEBM, MOV (max 40 MB) · en fazla 5 dosya",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const remaining = maxFiles - value.length;

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).slice(0, Math.max(0, remaining));
    if (list.length === 0) {
      setError(`En fazla ${maxFiles} dosya ekleyebilirsiniz`);
      return;
    }

    setUploading(true);
    setError(null);
    const next = [...value];

    try {
      for (const file of list) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload/public", { method: "POST", body: fd });
        const json = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !json.url) throw new Error(json.error ?? "Yükleme başarısız");
        next.push(json.url);
      }
      onChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-ink">{label}</p>
      <p className="mb-3 text-xs text-ink-soft">{hint}</p>

      {value.length > 0 ? (
        <ul className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {value.map((url, i) => (
            <li key={url} className="relative overflow-hidden border border-border bg-surface">
              {isImageAttachment(url) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" className="aspect-video w-full object-cover" />
              ) : isVideoAttachment(url) ? (
                <div className="flex aspect-video w-full flex-col items-center justify-center gap-1 bg-ink/5 text-ink-soft">
                  <Film className="h-7 w-7" />
                  <span className="px-2 text-center text-[10px] font-semibold uppercase tracking-wide">
                    Video
                  </span>
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center text-xs text-ink-soft">
                  Dosya
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center bg-ink/80 text-white hover:bg-brand"
                aria-label="Dosyayı kaldır"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {remaining > 0 ? (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 border border-dashed px-4 py-8 text-center transition-colors",
            dragOver
              ? "border-brand bg-brand/5 text-brand"
              : "border-border bg-surface text-ink-soft hover:border-brand hover:text-brand",
            uploading && "opacity-70",
          )}
        >
          <span className="flex h-11 w-11 items-center justify-center bg-white text-brand">
            {uploading ? (
              <Upload className="h-5 w-5 animate-pulse" />
            ) : (
              <FileImage className="h-5 w-5" />
            )}
          </span>
          <span className="text-sm font-semibold text-ink">
            {uploading ? "Yükleniyor..." : "Dosya seçin veya sürükleyip bırakın"}
          </span>
          <span className="text-xs">Kalan hak: {remaining}</span>
        </button>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) uploadFiles(e.target.files);
        }}
      />
      {error ? <p className="mt-2 text-xs font-medium text-brand">{error}</p> : null}
    </div>
  );
}
