"use client";

import { clientFormSubmit } from "@/lib/client-form";

import { useState } from "react";
import { ChartNoAxesCombined } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input } from "@/components/ui/FormField";
import { FormCard, FieldHint } from "@/components/admin/FormCard";
import { FormActions } from "@/components/admin/PanelUI";
import { saveGoogleSiteKitAction } from "@/actions/appearance";

export function GoogleSiteKitForm({
  googleAnalyticsId,
  googleTagManagerId,
  googleSiteVerification,
}: {
  googleAnalyticsId: string;
  googleTagManagerId: string;
  googleSiteVerification: string;
}) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setSaved(false);
    setError(null);
    const result = await saveGoogleSiteKitAction({
      googleAnalyticsId: String(formData.get("googleAnalyticsId") ?? ""),
      googleTagManagerId: String(formData.get("googleTagManagerId") ?? ""),
      googleSiteVerification: String(formData.get("googleSiteVerification") ?? ""),
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
  }

  return (
    <FormCard
      title="Google Site Kit"
      description="Analytics, Tag Manager ve Search Console — WordPress eklentisinin Next.js karşılığı."
      Icon={ChartNoAxesCombined}
      className="max-w-3xl"
    >
      <form onSubmit={clientFormSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldGroup label="Google Analytics 4" htmlFor="googleAnalyticsId">
          <Input
            id="googleAnalyticsId"
            name="googleAnalyticsId"
            defaultValue={googleAnalyticsId}
            placeholder="G-XXXXXXXXXX"
            autoComplete="off"
            spellCheck={false}
          />
          <FieldHint>
            analytics.google.com → Yönetici → Veri akışları → Ölçüm kimliği.
          </FieldHint>
        </FieldGroup>

        <FieldGroup label="Google Tag Manager" htmlFor="googleTagManagerId">
          <Input
            id="googleTagManagerId"
            name="googleTagManagerId"
            defaultValue={googleTagManagerId}
            placeholder="GTM-XXXXXXX"
            autoComplete="off"
            spellCheck={false}
          />
          <FieldHint>
            GTM doluysa Analytics genelde GTM içinden yönetilir; ikisini birden doldurmak şart değil.
          </FieldHint>
        </FieldGroup>

        <FieldGroup label="Search Console doğrulama" htmlFor="googleSiteVerification">
          <Input
            id="googleSiteVerification"
            name="googleSiteVerification"
            defaultValue={googleSiteVerification}
            placeholder="meta içeriği (content=... değeri)"
            autoComplete="off"
            spellCheck={false}
          />
          <FieldHint>
            search.google.com/search-console → HTML etiketi yöntemindeki content değeri.
          </FieldHint>
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
