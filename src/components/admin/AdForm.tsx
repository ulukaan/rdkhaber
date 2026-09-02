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
import { buildAdsenseSnippet, resolveAdsenseSlot } from "@/lib/adsense";

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
  const initialAdsenseCode = useMemo(
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
  const [adsenseCode, setAdsenseCode] = useState(initialAdsenseCode);
  const [adsenseSlot, setAdsenseSlot] = useState(defaults?.adsenseSlot ?? "");
  const isEdit = Boolean(defaults?.id);
  const def = getAdSlotDef(position);
  const detectedSlot = useMemo(
    () => resolveAdsenseSlot({ code: adsenseCode, slot: adsenseSlot }),
    [adsenseCode, adsenseSlot],
  );

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const raw = {
      name: String(formData.get("name") ?? ""),
      position,
      kind,
      imageUrl: String(formData.get("imageUrl") ?? ""),
      targetUrl: String(formData.get("targetUrl") ?? ""),
      adsenseCode,
      adsenseSlot,
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
        <input type="hidden" name="position" value={position} />
        <input type="hidden" name="kind" value={kind} />

        <FieldGroup label="Slot" htmlFor="position">
          <Select
            id="position"
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
                rows={8}
                value={adsenseCode}
                onChange={(e) => setAdsenseCode(e.target.value)}
                placeholder={'<ins class="adsbygoogle" data-ad-slot="2422679742" ...></ins>'}
                className="font-mono text-xs"
                spellCheck={false}
              />
              <FieldHint>
                AdSense panelindeki kodu yapıştırın. Slot numarası otomatik okunur; okunmazsa
                alttaki kutuya yazın.
              </FieldHint>
              {detectedSlot ? (
                <p className="mt-2 text-xs font-semibold text-emerald-700">
                  Algılanan slot: {detectedSlot}
                </p>
              ) : adsenseCode.trim() ? (
                <p className="mt-2 text-xs font-medium text-brand">
                  Slot henüz okunamadı — aşağıya slot numarasını elle yazın.
                </p>
              ) : null}
            </FieldGroup>
            <FieldGroup label="Slot numarası" htmlFor="adsenseSlot">
              <Input
                id="adsenseSlot"
                value={adsenseSlot}
                onChange={(e) => setAdsenseSlot(e.target.value)}
                placeholder="örn. 2422679742"
                inputMode="numeric"
                autoComplete="off"
              />
              <FieldHint>
                Gri yazı örnek metindir, dolu değildir. Kod okunmazsa slot numarasını buraya
                yazın.
              </FieldHint>
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
