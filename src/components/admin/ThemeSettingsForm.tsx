"use client";

import { clientFormSubmit } from "@/lib/client-form";

import { useState } from "react";
import { Palette } from "lucide-react";
import { updateSettingsAction } from "@/actions/settings";
import { FieldGroup, Input } from "@/components/ui/FormField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/admin/FormCard";
import { FormActions } from "@/components/admin/PanelUI";
import type { SettingKey } from "@/lib/settings";

export function ThemeSettingsForm({
  settings,
}: {
  settings: Record<SettingKey, string>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSaved(false);
    const raw = {
      ...settings,
      siteName: String(formData.get("siteName") ?? ""),
      siteSlogan: String(formData.get("siteSlogan") ?? ""),
      logoUrl: String(formData.get("logoUrl") ?? ""),
      faviconUrl: String(formData.get("faviconUrl") ?? ""),
      brandColor: String(formData.get("brandColor") ?? ""),
    };
    const result = await updateSettingsAction(raw);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <FormCard
      title="Tema ayarları"
      description="Site adı, logo ve marka rengi."
      Icon={Palette}
      className="max-w-xl"
    >
      <form onSubmit={clientFormSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldGroup label="Site adı" htmlFor="siteName">
          <Input id="siteName" name="siteName" defaultValue={settings.siteName} required />
        </FieldGroup>
        <FieldGroup label="Slogan" htmlFor="siteSlogan">
          <Input id="siteSlogan" name="siteSlogan" defaultValue={settings.siteSlogan} />
        </FieldGroup>
        <FieldGroup label="Logo" htmlFor="logoUrl">
          <ImageUploadField name="logoUrl" defaultValue={settings.logoUrl} />
        </FieldGroup>
        <FieldGroup label="Favicon" htmlFor="faviconUrl">
          <ImageUploadField name="faviconUrl" defaultValue={settings.faviconUrl} />
        </FieldGroup>
        <FieldGroup label="Marka rengi" htmlFor="brandColor">
          <Input
            id="brandColor"
            name="brandColor"
            type="color"
            defaultValue={settings.brandColor || "#d0021b"}
            className="h-10 w-24 p-1"
          />
        </FieldGroup>
        {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
        {saved ? <p className="text-sm font-medium text-emerald-700">Kaydedildi.</p> : null}
        <FormActions>
          <Button type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </FormActions>
      </form>
    </FormCard>
  );
}
