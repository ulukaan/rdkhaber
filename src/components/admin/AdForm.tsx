"use client";

import { clientFormSubmit } from "@/lib/client-form";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeDollarSign } from "lucide-react";
import { createAdAction, updateAdAction } from "@/actions/ad";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/FormField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";
import { FormCard, FieldHint } from "@/components/admin/FormCard";
import { FormActions } from "@/components/admin/PanelUI";
import { AD_GROUPS, formatSlotSize, getAdSlotDef } from "@/lib/ad-slots";
import { buildAdsenseSnippet } from "@/lib/adsense";

type AdKind = "BANNER" | "ADSENSE";

type Defaults = {
  id?: string;
  name?: string;
  position?: string;
  kind?: string;
  imageUrl?: string;
  targetUrl?: string;
  adsenseSlot?: string | null;
  adsenseLayout?: string | null;
  adsenseFormat?: string | null;
  active?: boolean;
};

export function AdForm({ defaults }: { defaults?: Defaults }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(defaults?.position ?? "152");
  const [kind, setKind] = useState<AdKind>(
    defaults?.kind === "ADSENSE" ? "ADSENSE" : "BANNER",
  );
  const isEdit = Boolean(defaults?.id);
  const def = getAdSlotDef(position);
  const defaultAdsenseCode = useMemo(
    () =>
      defaults?.kind === "ADSENSE"
        ? buildAdsenseSnippet({
            slot: defaults.adsenseSlot,
            layout: defaults.adsenseLayout,
            format: defaults.adsenseFormat,
          })
        : "",
    [defaults],
  );

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const raw = {
      name: String(formData.get("name") ?? ""),
      position: String(formData.get("position") ?? "152"),
      kind: String(formData.get("kind") ?? "BANNER"),
      imageUrl: String(formData.get("imageUrl") ?? ""),
      targetUrl: String(formData.get("targetUrl") ?? ""),
      adsenseCode: String(formData.get("adsenseCode") ?? ""),
      adsenseSlot: String(formData.get("adsenseSlot") ?? ""),
      active: formData.get("active") === "on",
    };
    const result = isEdit ? await updateAdAction(defaults!.id!, raw) : await createAdAction(raw);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/reklamlar");
  };

  return (
    <FormCard
      title={isEdit ? "Reklamı düzenle" : "Yeni reklam"}
      description="Görsel banner veya Google AdSense kodu ile slot doldurun."
      Icon={BadgeDollarSign}
      className="max-w-xl"
    >
      <form onSubmit={clientFormSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldGroup label="Slot" htmlFor="position">
          <Select
            id="position"
            name="position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            {AD_GROUPS.map((group) => (
              <optgroup key={group.id} label={group.title}>
                {group.slots.map((slot) => (
                  <option key={slot.code} value={slot.code}>
                    #{slot.code} {slot.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
          {def && (
            <p className="mt-1 text-xs text-ink-soft">
              {formatSlotSize(def) ?? "Ölçü serbest"}
              {def.imageOnly ? " · Sadece görsel" : ""}
              {def.note ? ` · ${def.note}` : ""}
            </p>
          )}
        </FieldGroup>

        <FieldGroup label="Reklam türü" htmlFor="kind-banner">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-ink">
              <input
                type="radio"
                name="kind"
                value="BANNER"
                checked={kind === "BANNER"}
                onChange={() => setKind("BANNER")}
                className="h-4 w-4 accent-[var(--brand)]"
              />
              Görsel banner
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-ink">
              <input
                type="radio"
                name="kind"
                value="ADSENSE"
                checked={kind === "ADSENSE"}
                onChange={() => setKind("ADSENSE")}
                className="h-4 w-4 accent-[var(--brand)]"
              />
              Google AdSense
            </label>
          </div>
          <FieldHint>
            AdSense kodunu adsense.google.com panelinden kopyalayıp aşağıya yapıştırın. Yayıncı
            kimliği Görünüm → Google Reklamlar sayfasında tanımlı olmalıdır.
          </FieldHint>
        </FieldGroup>

        <FieldGroup label="Başlık" htmlFor="name">
          <Input id="name" name="name" defaultValue={defaults?.name ?? def?.name} required />
        </FieldGroup>

        {kind === "BANNER" ? (
          <>
            <FieldGroup label="Görsel" htmlFor="imageUrl">
              <ImageUploadField name="imageUrl" defaultValue={defaults?.imageUrl} />
            </FieldGroup>
            <FieldGroup label="Hedef bağlantı" htmlFor="targetUrl">
              <Input
                id="targetUrl"
                name="targetUrl"
                defaultValue={defaults?.targetUrl}
                required
              />
            </FieldGroup>
          </>
        ) : (
          <>
            <FieldGroup label="AdSense kodu" htmlFor="adsenseCode">
              <Textarea
                id="adsenseCode"
                name="adsenseCode"
                rows={8}
                defaultValue={defaultAdsenseCode}
                placeholder={'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-..." ...></script>\n<ins class="adsbygoogle" ...></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'}
                className="font-mono text-xs"
                spellCheck={false}
              />
              <FieldHint>
                AdSense panelindeki tüm kodu olduğu gibi yapıştırın. Slot numarası otomatik okunur.
              </FieldHint>
            </FieldGroup>
            <FieldGroup label="Slot numarası (isteğe bağlı)" htmlFor="adsenseSlot">
              <Input
                id="adsenseSlot"
                name="adsenseSlot"
                defaultValue={defaults?.adsenseSlot ?? ""}
                placeholder="2422679742"
                inputMode="numeric"
                autoComplete="off"
              />
              <FieldHint>Kod yapıştırdıysanız boş bırakabilirsiniz.</FieldHint>
            </FieldGroup>
          </>
        )}

        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            name="active"
            defaultChecked={defaults?.active ?? true}
            className="h-4 w-4 rounded border-border"
          />
          Yayında
        </label>
        {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
        <FormActions>
          <Button type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Vazgeç
          </Button>
        </FormActions>
      </form>
    </FormCard>
  );
}
