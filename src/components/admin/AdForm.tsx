"use client";

import { clientFormSubmit } from "@/lib/client-form";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeDollarSign } from "lucide-react";
import { createAdAction, updateAdAction } from "@/actions/ad";
import { FieldGroup, Input, Select } from "@/components/ui/FormField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/admin/FormCard";
import { FormActions } from "@/components/admin/PanelUI";
import { AD_GROUPS, formatSlotSize, getAdSlotDef } from "@/lib/ad-slots";

type Defaults = {
  id?: string;
  name?: string;
  position?: string;
  imageUrl?: string;
  targetUrl?: string;
  active?: boolean;
};

export function AdForm({ defaults }: { defaults?: Defaults }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(defaults?.position ?? "152");
  const isEdit = Boolean(defaults?.id);
  const def = getAdSlotDef(position);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const raw = {
      name: String(formData.get("name") ?? ""),
      position: String(formData.get("position") ?? "152"),
      imageUrl: String(formData.get("imageUrl") ?? ""),
      targetUrl: String(formData.get("targetUrl") ?? ""),
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
      description="Slot, görsel ve hedef bağlantı."
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
        <FieldGroup label="Başlık" htmlFor="name">
          <Input id="name" name="name" defaultValue={defaults?.name ?? def?.name} required />
        </FieldGroup>
        <FieldGroup label="Görsel" htmlFor="imageUrl">
          <ImageUploadField name="imageUrl" defaultValue={defaults?.imageUrl} />
        </FieldGroup>
        <FieldGroup label="Hedef bağlantı" htmlFor="targetUrl">
          <Input id="targetUrl" name="targetUrl" defaultValue={defaults?.targetUrl} required />
        </FieldGroup>
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
