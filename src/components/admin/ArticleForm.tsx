"use client";

import { clientFormSubmit } from "@/lib/client-form";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  MonitorPlay,
  Search,
  Share2,
  UserRound,
  Video,
} from "lucide-react";
import { createArticleAction, updateArticleAction } from "@/actions/article";
import { slugify } from "@/lib/slug";
import { FieldGroup, Input, Textarea, Select } from "@/components/ui/FormField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { MultiImageUploadField } from "@/components/admin/MultiImageUploadField";
import { PlacementImages } from "@/components/admin/PlacementImages";
import { SharePostPreview } from "@/components/admin/SharePostPreview";
import { CategoryCheckboxes } from "@/components/admin/CategoryCheckboxes";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { FormCard, FieldHint } from "@/components/admin/FormCard";
import { Button } from "@/components/ui/Button";
import { PanelFormFooter, PANEL_FORM_BOTTOM_PAD } from "@/components/admin/PanelFormFooter";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string };

export type ArticleDefaults = {
  id?: string;
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
  coverImageUrl?: string | null;
  videoUrl?: string | null;
  videoEmbed?: string | null;
  galleryImages?: Array<{ url: string; caption: string }>;
  categoryId?: string;
  categoryIds?: string[];
  tagNames?: string;
  status?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  inSpotlight?: boolean;
  inFiveHeadline?: boolean;
  imageMainHeadline?: string | null;
  imageTopHeadline?: string | null;
  imageSpotlight?: string | null;
  imageFiveHeadline?: string | null;
  imageSocial?: string | null;
  imageStory?: string | null;
  reporterName?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  redirectUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  publishedAt?: string | Date | null;
  scheduledAt?: string | Date | null;
  isLiveBlog?: boolean;
  viewCount?: number;
};

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Taslak" },
  { value: "REVIEW", label: "İncelemede" },
  { value: "PUBLISHED", label: "Yayında" },
  { value: "ARCHIVED", label: "Arşivlendi" },
];

const SUMMARY_LIMIT = 160;

function toDatetimeLocal(value?: string | Date | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ArticleForm({
  categories,
  defaults,
  quickMode = false,
}: {
  categories: Category[];
  defaults?: ArticleDefaults;
  /** Dashboard “Hızlı haber” — doğrudan yazıma odaklanır. */
  quickMode?: boolean;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults?.slug));
  const [summary, setSummary] = useState(defaults?.summary ?? "");
  const [status, setStatus] = useState(defaults?.status ?? "DRAFT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(defaults?.id);

  useEffect(() => {
    if (!quickMode || isEdit) return;
    const el = document.getElementById("title") as HTMLInputElement | null;
    if (!el) return;
    el.focus({ preventScroll: false });
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [quickMode, isEdit]);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    const raw = {
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      content: String(formData.get("content") ?? ""),
      coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
      videoUrl: String(formData.get("videoUrl") ?? ""),
      videoEmbed: String(formData.get("videoEmbed") ?? ""),
      galleryImages: String(formData.get("galleryImages") ?? "[]"),
      categoryIds: formData.getAll("categoryIds").map(String).filter(Boolean),
      tagNames: String(formData.get("tagNames") ?? ""),
      status: String(formData.get("status") ?? "DRAFT"),
      isBreaking: formData.get("isBreaking") === "on",
      isFeatured: formData.get("isFeatured") === "on",
      inSpotlight: formData.get("inSpotlight") === "on",
      inFiveHeadline: formData.get("inFiveHeadline") === "on",
      imageMainHeadline: String(formData.get("imageMainHeadline") ?? ""),
      imageTopHeadline: String(formData.get("imageTopHeadline") ?? ""),
      imageSpotlight: String(formData.get("imageSpotlight") ?? ""),
      imageFiveHeadline: String(formData.get("imageFiveHeadline") ?? ""),
      imageSocial: String(formData.get("imageSocial") ?? ""),
      imageStory: String(formData.get("imageStory") ?? ""),
      reporterName: String(formData.get("reporterName") ?? ""),
      sourceName: String(formData.get("sourceName") ?? ""),
      sourceUrl: String(formData.get("sourceUrl") ?? ""),
      redirectUrl: String(formData.get("redirectUrl") ?? ""),
      seoTitle: String(formData.get("seoTitle") ?? ""),
      seoDescription: String(formData.get("seoDescription") ?? ""),
      seoKeywords: String(formData.get("seoKeywords") ?? ""),
      publishedAt: String(formData.get("publishedAt") ?? ""),
      scheduledAt: String(formData.get("scheduledAt") ?? ""),
      isLiveBlog: formData.get("isLiveBlog") === "on",
    };

    if (raw.categoryIds.length === 0) {
      setLoading(false);
      setError("En az bir kategori seçin.");
      return;
    }

    const result = isEdit
      ? await updateArticleAction(defaults!.id!, raw)
      : await createArticleAction(raw);

    setLoading(false);
    if (result?.error) setError(result.error);
  };

  return (
    <form onSubmit={clientFormSubmit(onSubmit)} className={cn("flex flex-col gap-5", PANEL_FORM_BOTTOM_PAD)}>
      <section
        id="galeri"
        className="rounded-xl border border-border bg-white px-3 py-2.5 shadow-sm sm:px-4"
      >
        <div className="mb-2 flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-brand" aria-hidden />
          <h3 className="text-sm font-bold text-ink">Fotoğraf</h3>
          <span className="text-xs text-ink-soft">Kapak · galeri</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:items-start">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              Ana görsel
            </p>
            <ImageUploadField compact name="coverImageUrl" defaultValue={defaults?.coverImageUrl} />
          </div>
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              Galeri
            </p>
            <MultiImageUploadField
              compact
              name="galleryImages"
              defaultValue={defaults?.galleryImages ?? []}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <FormCard title="Haber" description="Okuyucunun göreceği metin." Icon={FileText}>
            <div className="flex flex-col gap-4">
              <FieldGroup label="Haber başlığı" htmlFor="title">
                <Input
                  id="title"
                  name="title"
                  defaultValue={defaults?.title}
                  required
                  autoFocus={quickMode}
                  placeholder="Haber başlığını yazın"
                  onChange={(e) => {
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                />
              </FieldGroup>

              <FieldGroup label="Haber adresi" htmlFor="slug">
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
                  Site adresi: <span className="font-mono text-ink">/haber/{slug || "haber-adresi"}</span>
                </FieldHint>
              </FieldGroup>

              <FieldGroup label="Spot" htmlFor="summary">
                <Textarea
                  id="summary"
                  name="summary"
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  required
                  placeholder="Başlığın hemen altında çıkan kısa açıklama. İkinci cümle paylaşım kartında ‘Neden önemli’ olur."
                />
                <p
                  className={cn(
                    "mt-1 text-xs",
                    summary.length > SUMMARY_LIMIT ? "font-semibold text-brand" : "text-ink-soft",
                  )}
                >
                  {summary.length} / {SUMMARY_LIMIT} karakter
                  {summary.length > SUMMARY_LIMIT ? " — Google’da kısaltılabilir" : " önerilen uzunluk"}
                </p>
              </FieldGroup>

              <FieldGroup label="Haber metni" htmlFor="content">
                <RichTextEditor
                  name="content"
                  defaultValue={defaults?.content ?? ""}
                  placeholder="Haberi yazın. Araç çubuğundan metin içine görsel ekleyebilirsiniz."
                />
                <FieldHint>Metnin içine birden fazla fotoğraf koyabilirsiniz.</FieldHint>
              </FieldGroup>
            </div>
          </FormCard>

          <FormCard
            title="Video"
            description="Video haberse burayı doldurun."
            Icon={Video}
            collapsible
            defaultOpen={false}
          >
            <div className="flex flex-col gap-4">
              <FieldGroup label="Video bağlantısı" htmlFor="videoUrl">
                <Input
                  id="videoUrl"
                  name="videoUrl"
                  defaultValue={defaults?.videoUrl ?? ""}
                  placeholder="YouTube veya video dosyası adresi"
                />
                <FieldHint>Doluysa haber Video Haberler’de de çıkar.</FieldHint>
              </FieldGroup>

              <FieldGroup label="Video kodu" htmlFor="videoEmbed">
                <Textarea
                  id="videoEmbed"
                  name="videoEmbed"
                  rows={3}
                  defaultValue={defaults?.videoEmbed ?? ""}
                  placeholder="Gerekirse iframe kodu"
                  className="font-mono text-[13px]"
                />
                <FieldHint>Bağlantı varsa o kullanılır; kod yedektir.</FieldHint>
              </FieldGroup>
            </div>
          </FormCard>

          <FormCard
            title="Google ve paylaşım"
            description="Boş bırakırsanız başlık ve spot kullanılır."
            Icon={Search}
            collapsible
            defaultOpen={false}
          >
            <div className="flex flex-col gap-4">
              <FieldGroup label="Google başlığı" htmlFor="seoTitle">
                <Input
                  id="seoTitle"
                  name="seoTitle"
                  defaultValue={defaults?.seoTitle ?? ""}
                  placeholder="Arama sonuçlarında görünen başlık"
                />
              </FieldGroup>
              <FieldGroup label="Google açıklaması" htmlFor="seoDescription">
                <Textarea
                  id="seoDescription"
                  name="seoDescription"
                  rows={3}
                  defaultValue={defaults?.seoDescription ?? ""}
                  placeholder="Arama sonuçlarındaki kısa metin"
                />
              </FieldGroup>
              <FieldGroup label="Anahtar kelimeler" htmlFor="seoKeywords">
                <Input
                  id="seoKeywords"
                  name="seoKeywords"
                  defaultValue={defaults?.seoKeywords ?? ""}
                  placeholder="duzce, operasyon, emniyet"
                />
                <FieldHint>Virgülle ayırın.</FieldHint>
              </FieldGroup>
            </div>
          </FormCard>
        </div>

        <aside
          className={cn(
            "lg:col-span-1 lg:self-start",
            quickMode ? "order-last lg:order-none" : "order-first lg:order-none",
          )}
        >
          <div className="flex flex-col gap-6 lg:sticky lg:top-16 lg:z-10">
            <AsideGroup label="Yayın">
              <FormCard
                title="Yayın ayarları"
                description="Kategori, durum ve zaman."
                Icon={LayoutGrid}
                collapsible
                defaultOpen
              >
                <div className="flex flex-col gap-4">
                  <FieldGroup label="Kategori">
                    <CategoryCheckboxes
                      categories={categories}
                      defaultIds={
                        defaults?.categoryIds?.length
                          ? defaults.categoryIds
                          : defaults?.categoryId
                            ? [defaults.categoryId]
                            : []
                      }
                    />
                  </FieldGroup>

                  <FieldGroup label="Yayın durumu" htmlFor="status">
                    <Select
                      id="status"
                      name="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </Select>
                    <FieldHint>
                      {status === "PUBLISHED"
                        ? "Sitede herkese açık."
                        : status === "REVIEW"
                          ? "Onay bekliyor, sitede yok."
                          : status === "ARCHIVED"
                            ? "Arşivde, listelenmez."
                            : "Taslak; sitede görünmez."}
                    </FieldHint>
                  </FieldGroup>

                  <FieldGroup label="Yayın zamanı" htmlFor="publishedAt">
                    <Input
                      id="publishedAt"
                      name="publishedAt"
                      type="datetime-local"
                      defaultValue={toDatetimeLocal(defaults?.publishedAt)}
                    />
                    <FieldHint>Boşsa yayına alınca şu anki saat yazılır.</FieldHint>
                  </FieldGroup>

                  <FieldGroup label="Zamanlanmış yayın" htmlFor="scheduledAt">
                    <Input
                      id="scheduledAt"
                      name="scheduledAt"
                      type="datetime-local"
                      defaultValue={toDatetimeLocal(defaults?.scheduledAt)}
                    />
                    <FieldHint>Gelecek tarih seçilirse haber o saatte otomatik yayınlanır.</FieldHint>
                  </FieldGroup>

                  <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
                    <input
                      type="checkbox"
                      name="isLiveBlog"
                      defaultChecked={defaults?.isLiveBlog}
                      className="h-4 w-4 accent-brand"
                    />
                    Canlı anlatım modu
                  </label>

                  <FieldGroup label="Etiketler" htmlFor="tagNames">
                    <Input
                      id="tagNames"
                      name="tagNames"
                      defaultValue={defaults?.tagNames}
                      placeholder="Düzce, emniyet"
                    />
                    <FieldHint>Virgülle ayırın.</FieldHint>
                  </FieldGroup>

                  {typeof defaults?.viewCount === "number" ? (
                    <p className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-ink-soft">
                      Okunma: <span className="font-bold text-ink">{defaults.viewCount}</span>
                    </p>
                  ) : null}
                </div>
              </FormCard>
            </AsideGroup>

            <AsideGroup label="Anasayfa">
              <FormCard
                title="Vitrin konumları"
                description="Nerede görünsün ve özel görseller."
                Icon={MonitorPlay}
                collapsible
                defaultOpen={false}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                      Nerede görünsün
                    </p>
                    <ToggleRow
                      name="isBreaking"
                      defaultChecked={defaults?.isBreaking}
                      label="Son dakika bandı"
                      hint="Üstteki kırmızı kayan yazı. Yayından sonra 24 saat."
                    />
                    <ToggleRow
                      name="isFeatured"
                      defaultChecked={defaults?.isFeatured}
                      label="Büyük manşet"
                      hint="Ana sayfadaki büyük slayt."
                    />
                    <ToggleRow
                      name="inFiveHeadline"
                      defaultChecked={defaults?.inFiveHeadline}
                      label="Sürmanşet"
                      hint="Büyük sürmanşet şeridi (1–10)."
                    />
                    <ToggleRow
                      name="inSpotlight"
                      defaultChecked={defaults?.inSpotlight}
                      label="Öne çıkanlar"
                      hint="Öne çıkan haber kutuları."
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                      Konuma özel görsel
                    </p>
                    <PlacementImages
                      bare
                      excludeCover
                      showToggles={false}
                      showVideoNote={false}
                      defaults={{
                        imageMainHeadline: defaults?.imageMainHeadline,
                        imageTopHeadline: defaults?.imageTopHeadline,
                        imageSpotlight: defaults?.imageSpotlight,
                        imageFiveHeadline: defaults?.imageFiveHeadline,
                        imageSocial: defaults?.imageSocial,
                        imageStory: defaults?.imageStory,
                      }}
                    />
                    <FieldHint>Boş bırakılan yerde ana görsel kullanılır.</FieldHint>
                  </div>
                </div>
              </FormCard>
            </AsideGroup>

            <AsideGroup label="Paylaşım">
              <FormCard
                title="Instagram kartı"
                description="Kaydettikten sonra indirip paylaş."
                Icon={Share2}
                collapsible
                defaultOpen={false}
              >
                <SharePostPreview bare slug={defaults?.id ? slug : undefined} title={defaults?.title} />
              </FormCard>
            </AsideGroup>

            <AsideGroup label="Künye">
              <FormCard
                key="kunye-collapsed"
                title="Künye"
                description="Yazar ve haber kaynağı."
                Icon={UserRound}
                collapsible
                defaultOpen={false}
              >
                <div className="flex flex-col gap-4">
                  <FieldGroup label="Yazar" htmlFor="reporterName">
                    <Input
                      id="reporterName"
                      name="reporterName"
                      defaultValue={defaults?.reporterName ?? ""}
                      placeholder="Örn. Düzce Radikal"
                    />
                    <FieldHint>Haber sayfasında yazar olarak görünür.</FieldHint>
                  </FieldGroup>
                  <FieldGroup label="Ajans / kaynak" htmlFor="sourceName">
                    <Input
                      id="sourceName"
                      name="sourceName"
                      defaultValue={defaults?.sourceName ?? ""}
                      placeholder="AA, DHA…"
                    />
                  </FieldGroup>
                  <FieldGroup label="Kaynak bağlantısı" htmlFor="sourceUrl">
                    <Input
                      id="sourceUrl"
                      name="sourceUrl"
                      defaultValue={defaults?.sourceUrl ?? ""}
                      placeholder="https://..."
                    />
                  </FieldGroup>
                  <FieldGroup label="Başka sayfaya git" htmlFor="redirectUrl">
                    <Input
                      id="redirectUrl"
                      name="redirectUrl"
                      defaultValue={defaults?.redirectUrl ?? ""}
                      placeholder="https://..."
                    />
                    <FieldHint>Doluysa bu haber o adrese gider.</FieldHint>
                  </FieldGroup>
                </div>
              </FormCard>
            </AsideGroup>

            {isEdit && slug ? (
              <a
                href={`/haber/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-ink-soft shadow-sm transition-colors hover:border-brand hover:text-brand"
              >
                <ExternalLink className="h-4 w-4" />
                Haberi sitede görüntüle
              </a>
            ) : null}
          </div>
        </aside>
      </div>

      <PanelFormFooter>
        {error ? <p className="mr-auto w-full text-sm font-medium text-brand sm:w-auto">{error}</p> : null}
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => router.back()}>
          Vazgeç
        </Button>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Kaydediliyor..." : isEdit ? "Güncelle" : "Kaydet"}
        </Button>
      </PanelFormFooter>
    </form>
  );
}

function AsideGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <p className="px-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-soft/80">
        {label}
      </p>
      {children}
    </div>
  );
}

function ToggleRow({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-surface">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-4 w-4" />
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="text-xs text-ink-soft">{hint}</span>
      </span>
    </label>
  );
}
