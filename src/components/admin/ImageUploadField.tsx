"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Input } from "@/components/ui/FormField";

export function ImageUploadField({
  name,
  defaultValue,
  variant = "cover",
  onValueChange,
}: {
  name: string;
  defaultValue?: string | null;
  variant?: "cover" | "avatar";
  onValueChange?: (url: string) => void;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Yükleme başarısız");
      setPreviewFailed(false);
      setUrl(json.url);
      onValueChange?.(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="hidden" name={name} value={url} />
      {url ? (
        <div
          className={
            variant === "avatar"
              ? "relative mb-2 h-32 w-32 overflow-hidden rounded-full border border-border bg-surface"
              : "relative mb-2 h-40 w-full overflow-hidden rounded border border-border"
          }
        >
          <Image
            src={url}
            alt="Kapak görseli"
            fill
            className={variant === "avatar" ? "object-cover" : "object-contain bg-surface"}
            unoptimized
            onError={() => setPreviewFailed(true)}
          />
          <button
            type="button"
            onClick={() => {
              setPreviewFailed(false);
              setUrl("");
              onValueChange?.("");
            }}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mb-2 flex h-32 w-full flex-col items-center justify-center gap-1 rounded border border-dashed border-border text-ink-soft hover:border-brand hover:text-brand"
        >
          <Upload className="h-5 w-5" />
          <span className="text-xs font-semibold">
            {uploading ? "Yükleniyor..." : variant === "avatar" ? "Fotoğraf yükle" : "Görsel Yükle"}
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <Input
        placeholder="veya görsel URL'i yapıştırın"
        value={url}
        onChange={(e) => {
          setPreviewFailed(false);
          setUrl(e.target.value);
          onValueChange?.(e.target.value);
        }}
      />
      {previewFailed && url ? (
        <p className="mt-1 text-xs text-ink-soft">Önizleme yüklenemedi; adres kayıtlı duruyor.</p>
      ) : null}
      {error && <p className="mt-1 text-xs font-medium text-brand">{error}</p>}
    </div>
  );
}
