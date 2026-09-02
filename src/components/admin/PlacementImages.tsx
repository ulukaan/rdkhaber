"use client";

import { useState } from "react";
import { ImageIcon, Trash2, Video } from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";

export type PlacementDef = {
  /** Form alan adı — konuma özel görsel. */
  imageName: string;
  /** Varsa bu konumu açıp kapatan onay kutusunun adı. */
  toggleName?: string;
  label: string;
  hint?: string;
};

export const PLACEMENTS: PlacementDef[] = [
  { imageName: "coverImageUrl", label: "Ana görsel", hint: "Diğerleri boşsa bu kullanılır" },
  { imageName: "imageMainHeadline", toggleName: "isFeatured", label: "Büyük manşet", hint: "Ana slayt" },
  { imageName: "imageTopHeadline", toggleName: "isBreaking", label: "Son dakika", hint: "Üst bant" },
  { imageName: "imageSpotlight", toggleName: "inSpotlight", label: "Öne çıkan", hint: "Öne çıkanlar alanı" },
  { imageName: "imageFiveHeadline", toggleName: "inFiveHeadline", label: "Sürmanşet", hint: "Büyük sürmanşet şeridi" },
  { imageName: "imageSocial", label: "Paylaşım görseli", hint: "Boşsa Instagram kartı otomatik üretilir" },
  { imageName: "imageStory", label: "Hikâye görseli", hint: "Dikey 9:16" },
];

export type PlacementValues = Record<string, string | boolean | null | undefined>;

/**
 * Referans paneldeki "KONUMLAR" bloğu: her vitrin için ayrı görsel ve
 * (varsa) o vitrine ekleme anahtarı.
 */
export function PlacementImages({
  defaults,
  excludeCover = false,
  showToggles = true,
  showVideoNote = true,
  title = "Anasayfa görselleri",
  description = "Boş bırakılan yerde ana görsel kullanılır.",
}: {
  defaults?: PlacementValues;
  excludeCover?: boolean;
  showToggles?: boolean;
  showVideoNote?: boolean;
  title?: string;
  description?: string;
}) {
  const items = PLACEMENTS.filter((p) => !(excludeCover && p.imageName === "coverImageUrl")).map(
    (p) => (showToggles ? p : { ...p, toggleName: undefined }),
  );

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      <header className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        <p className="mt-0.5 text-xs text-ink-soft">{description}</p>
      </header>
      <ul className="divide-y divide-border">
        {items.map((p) => (
          <PlacementRow
            key={p.imageName}
            def={p}
            defaultImage={(defaults?.[p.imageName] as string | null) ?? ""}
            defaultChecked={Boolean(p.toggleName && defaults?.[p.toggleName])}
          />
        ))}
        {showVideoNote ? (
          <li className="flex items-center gap-3 px-5 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ink-soft">
              <Video className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-ink">Video</span>
              <span className="text-xs text-ink-soft">Video alanı “Medya” bölümünden doldurulur</span>
            </span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}

function PlacementRow({
  def,
  defaultImage,
  defaultChecked,
}: {
  def: PlacementDef;
  defaultImage: string;
  defaultChecked: boolean;
}) {
  const [url, setUrl] = useState(defaultImage);
  const [open, setOpen] = useState(false);

  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <input type="hidden" name={def.imageName} value={url} />

      {def.toggleName ? (
        <input
          type="checkbox"
          name={def.toggleName}
          defaultChecked={defaultChecked}
          className="h-4 w-4 shrink-0"
          aria-label={`${def.label} konumuna ekle`}
          title={`${def.label} konumuna ekle`}
        />
      ) : (
        <span className="w-4 shrink-0" aria-hidden />
      )}

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink">{def.label}</span>
        {def.hint ? <span className="text-xs text-ink-soft">{def.hint}</span> : null}
      </span>

      {url ? (
        <span className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-10 w-14 overflow-hidden rounded border border-border"
            title="Görseli değiştir"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={def.label} className="h-full w-full object-cover" />
          </button>
          <button
            type="button"
            onClick={() => setUrl("")}
            aria-label={`${def.label} görselini kaldır`}
            title="Kaldır"
            className="flex h-8 w-8 items-center justify-center rounded text-ink-soft hover:text-brand"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`${def.label} görseli seç`}
          title="Görsel seç"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-ink-soft transition-colors hover:border-brand hover:text-brand"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
      )}

      <MediaPicker open={open} onClose={() => setOpen(false)} onSelect={setUrl} />
    </li>
  );
}
