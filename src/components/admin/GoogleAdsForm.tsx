"use client";

import { clientFormSubmit } from "@/lib/client-form";

import { useState } from "react";
import { BadgeDollarSign } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input } from "@/components/ui/FormField";
import { FormCard, FieldHint } from "@/components/admin/FormCard";
import { FormActions } from "@/components/admin/PanelUI";
import { saveGoogleAdsAction } from "@/actions/appearance";

export function GoogleAdsForm({
  googleAdsenseClient,
  googleAdsenseAutoAds,
}: {
  googleAdsenseClient: string;
  googleAdsenseAutoAds: string;
}) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoAds, setAutoAds] = useState(googleAdsenseAutoAds === "1");

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setSaved(false);
    setError(null);
    const result = await saveGoogleAdsAction({
      googleAdsenseClient: String(formData.get("googleAdsenseClient") ?? ""),
      googleAdsenseAutoAds: autoAds ? "1" : "0",
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
      title="Google Reklamlar (AdSense)"
      description="Yayıncı kimliği ve otomatik reklamlar. Manuel AdSense birimleri Reklam Grupları’ndan kod yapıştırarak eklenir."
      Icon={BadgeDollarSign}
      className="max-w-3xl"
    >
      <form onSubmit={clientFormSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldGroup label="AdSense yayıncı kimliği" htmlFor="googleAdsenseClient">
          <Input
            id="googleAdsenseClient"
            name="googleAdsenseClient"
            defaultValue={googleAdsenseClient}
            placeholder="ca-pub-XXXXXXXXXXXXXXXX"
            autoComplete="off"
            spellCheck={false}
          />
          <FieldHint>
            adsense.google.com → Hesap → Hesap bilgileri → Yayıncı kimliği. ads.txt otomatik üretilir.
          </FieldHint>
        </FieldGroup>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface/40 px-4 py-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-[var(--brand)]"
            checked={autoAds}
            onChange={(e) => setAutoAds(e.target.checked)}
          />
          <span>
            <span className="block text-sm font-semibold text-ink">Otomatik reklamlar</span>
            <span className="mt-0.5 block text-xs text-ink-soft">
              AdSense Auto ads script’ini sitede yükler. Panelden onaylı sitelerde çalışır.
            </span>
          </span>
        </label>

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
