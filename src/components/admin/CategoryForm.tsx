"use client";

import { clientFormSubmit } from "@/lib/client-form";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderTree } from "lucide-react";
import { createCategoryAction, updateCategoryAction } from "@/actions/category";
import { slugify } from "@/lib/slug";
import { FieldGroup, Input, Textarea, Select } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { FormCard, FieldGrid, FieldHint } from "@/components/admin/FormCard";
import { FormActions } from "@/components/admin/PanelUI";
import { cn } from "@/lib/utils";

type CategoryDefaults = {
  id?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  color?: string | null;
  order?: number;
  parentId?: string | null;
  headingH1?: string | null;
  boxCount?: number;
  photoGallery?: boolean;
  videoGallery?: boolean;
  fixedDesign?: boolean;
  fixedTemplate?: string | null;
  hoverColor?: string | null;
  headerTextColor?: string | null;
  headerHoverColor?: string | null;
};

type ParentOption = { id: string; name: string };

function ToggleRow({
  name,
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  name: string;
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (on: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-border bg-surface/40 px-4 py-3">
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="mt-0.5 block text-xs text-ink-soft">{hint}</span>
      </span>
      <input type="hidden" name={name} value={checked ? "1" : "0"} />
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-10 shrink-0 rounded-md border transition-colors",
          checked ? "border-brand bg-brand" : "border-border bg-white",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-md bg-white shadow-sm transition-[left]",
            checked ? "left-[18px]" : "left-0.5",
          )}
        />
      </button>
    </label>
  );
}

function ColorField({
  id,
  name,
  label,
  hint,
  defaultValue,
}: {
  id: string;
  name: string;
  label: string;
  hint: string;
  defaultValue?: string | null;
}) {
  return (
    <FieldGroup label={label} htmlFor={id}>
      <Input
        id={id}
        name={name}
        type="color"
        defaultValue={defaultValue || "#d0021b"}
        className="h-10 w-full max-w-[140px] p-1"
      />
      <FieldHint>{hint}</FieldHint>
    </FieldGroup>
  );
}

export function CategoryForm({
  defaults,
  parents = [],
}: {
  defaults?: CategoryDefaults;
  parents?: ParentOption[];
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults?.slug));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const resolvedTemplate =
    defaults?.fixedTemplate === "liste" || defaults?.fixedTemplate === "ekonomi"
      ? "liste"
      : defaults?.fixedTemplate === "dergi" || defaults?.fixedTemplate === "magazin"
        ? "dergi"
        : "klasik";
  const initialMode = defaults?.videoGallery
    ? "video"
    : defaults?.photoGallery
      ? "photo"
      : resolvedTemplate;
  const [mode, setMode] = useState<"klasik" | "liste" | "dergi" | "photo" | "video">(initialMode);
  const isEdit = Boolean(defaults?.id);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const isPhoto = mode === "photo";
    const isVideo = mode === "video";
    const template = mode === "liste" || mode === "dergi" || mode === "klasik" ? mode : "klasik";
    const raw = {
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      description: String(formData.get("description") ?? ""),
      color: String(formData.get("color") ?? ""),
      order: Number(formData.get("order") ?? 0),
      parentId: String(formData.get("parentId") ?? ""),
      headingH1: String(formData.get("headingH1") ?? ""),
      boxCount: Number(formData.get("boxCount") ?? 18),
      photoGallery: isPhoto,
      videoGallery: isVideo,
      fixedDesign: !isPhoto && !isVideo,
      fixedTemplate: !isPhoto && !isVideo ? template : "",
      hoverColor: String(formData.get("hoverColor") ?? ""),
      headerTextColor: String(formData.get("headerTextColor") ?? ""),
      headerHoverColor: String(formData.get("headerHoverColor") ?? ""),
    };

    const result = isEdit
      ? await updateCategoryAction(defaults!.id!, raw)
      : await createCategoryAction(raw);

    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/kategoriler");
  };

  return (
    <form onSubmit={clientFormSubmit(onSubmit)} className="flex max-w-3xl flex-col gap-6">
      <FormCard
        title={isEdit ? "Kategoriyi düzenle" : "Yeni kategori"}
        description="Ad, adres ve hiyerarşi."
        Icon={FolderTree}
      >
        <div className="flex flex-col gap-4">
          <FieldGroup label="Ad" htmlFor="name">
            <Input
              id="name"
              name="name"
              defaultValue={defaults?.name}
              required
              onChange={(e) => {
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
            />
            <FieldHint>Adın sitede nasıl görüntüleneceği.</FieldHint>
          </FieldGroup>

          <FieldGroup label="Adres son eki" htmlFor="slug">
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              required
            />
            <FieldHint>
              Sayfa adresi: /{slug || "ornek"}. Küçük harf, rakam ve tire.
            </FieldHint>
          </FieldGroup>

          <FieldGroup label="Üst kategori" htmlFor="parentId">
            <Select id="parentId" name="parentId" defaultValue={defaults?.parentId ?? ""}>
              <option value="">Hiçbiri</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            <FieldHint>
              Kategoriler hiyerarşik olabilir. Örneğin bir ana kategoriye bağlı alt
              kategoriler.
            </FieldHint>
          </FieldGroup>

          <FieldGroup label="Açıklama" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={defaults?.description ?? ""}
            />
            <FieldHint>
              Varsayılan olarak ön planda değildir; kategori sayfasında görünebilir.
            </FieldHint>
          </FieldGroup>

          <FieldGroup label="Kategori H1 yazısı" htmlFor="headingH1">
            <Input
              id="headingH1"
              name="headingH1"
              defaultValue={defaults?.headingH1 ?? defaults?.name ?? ""}
            />
            <FieldHint>Kategori sayfasında SEO için H1 olarak kullanılır.</FieldHint>
          </FieldGroup>

          <FieldGrid>
            <FieldGroup label="Kategori içerik sayısı" htmlFor="boxCount">
              <Input
                id="boxCount"
                name="boxCount"
                type="number"
                min={1}
                max={96}
                defaultValue={defaults?.boxCount ?? 18}
              />
              <FieldHint>Önerilen: 9, 18, 27, 36.</FieldHint>
            </FieldGroup>
            <FieldGroup label="Sıra" htmlFor="order">
              <Input id="order" name="order" type="number" defaultValue={defaults?.order ?? 0} />
            </FieldGroup>
          </FieldGrid>
        </div>
      </FormCard>

      <FormCard
        title="Görünüm"
        description="Üç ortak şablon. Her birinde üstte Ana Manşet 10 sabittir."
      >
        <div className="flex flex-col gap-3">
          <FieldGroup label="Sayfa şablonu (Sabit tasarım)" htmlFor="pageTemplate">
            <Select
              id="pageTemplate"
              value={mode === "photo" || mode === "video" ? "klasik" : mode}
              onChange={(e) => setMode(e.target.value as "klasik" | "liste" | "dergi")}
              disabled={mode === "photo" || mode === "video"}
            >
              <option value="klasik">Şablon 1 — Klasik (kart ızgarası)</option>
              <option value="liste">Şablon 2 — Liste</option>
              <option value="dergi">Şablon 3 — Dergi</option>
            </Select>
            <FieldHint>
              Spor / Ekonomi / Magazin yerine bu üç şablon kullanılır. Hepsinin üstünde Ana Manşet
              10 (sol 1–10 slider, sağ 6 kart) vardır.
            </FieldHint>
          </FieldGroup>
          <input
            type="hidden"
            name="fixedTemplate"
            value={mode === "liste" || mode === "dergi" || mode === "klasik" ? mode : "klasik"}
          />
          <input type="hidden" name="fixedDesign" value={mode === "photo" || mode === "video" ? "0" : "1"} />
          <input type="hidden" name="photoGallery" value={mode === "photo" ? "1" : "0"} />
          <input type="hidden" name="videoGallery" value={mode === "video" ? "1" : "0"} />

          <ToggleRow
            name="photoGalleryToggle"
            label="Foto Galeri"
            hint="Şablon yerine yalnızca foto galeri listesi (Ana Manşet 10 yok)."
            checked={mode === "photo"}
            onCheckedChange={(on) => setMode(on ? "photo" : "klasik")}
          />
          <ToggleRow
            name="videoGalleryToggle"
            label="Video Galeri"
            hint="Şablon yerine yalnızca videolu haberler (Ana Manşet 10 yok)."
            checked={mode === "video"}
            onCheckedChange={(on) => setMode(on ? "video" : "klasik")}
          />
        </div>
      </FormCard>

      <FormCard title="Renkler" description="Kategori başlığı ve hover renkleri.">
        <FieldGrid className="md:grid-cols-2">
          <ColorField
            id="color"
            name="color"
            label="Header rengi"
            hint="Kategori şeridi ve rozet rengi."
            defaultValue={defaults?.color}
          />
          <ColorField
            id="hoverColor"
            name="hoverColor"
            label="Genel hover rengi"
            hint="Kart üzerine gelince kullanılan renk."
            defaultValue={defaults?.hoverColor || defaults?.color}
          />
          <ColorField
            id="headerTextColor"
            name="headerTextColor"
            label="Header yazı rengi"
            hint="Başlık şeridindeki yazı."
            defaultValue={defaults?.headerTextColor || "#ffffff"}
          />
          <ColorField
            id="headerHoverColor"
            name="headerHoverColor"
            label="Header hover rengi"
            hint="Başlık bağlantısına gelince."
            defaultValue={defaults?.headerHoverColor || "#ffffff"}
          />
        </FieldGrid>
      </FormCard>

      {error && <p className="text-sm font-medium text-brand">{error}</p>}

      <FormActions>
        <Button type="submit" disabled={loading}>
          {loading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Ekle"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Vazgeç
        </Button>
      </FormActions>
    </form>
  );
}
