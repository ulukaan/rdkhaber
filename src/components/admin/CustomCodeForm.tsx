"use client";

import { clientFormSubmit } from "@/lib/client-form";

import { useState } from "react";
import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Textarea } from "@/components/ui/FormField";
import { FormCard, FieldHint } from "@/components/admin/FormCard";
import { FormActions } from "@/components/admin/PanelUI";
import { saveCustomCodeAction } from "@/actions/appearance";

export function CustomCodeForm({
  customHeadHtml,
  customBodyEndHtml,
}: {
  customHeadHtml: string;
  customBodyEndHtml: string;
}) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setSaved(false);
    await saveCustomCodeAction({
      customHeadHtml: String(formData.get("customHeadHtml") ?? ""),
      customBodyEndHtml: String(formData.get("customBodyEndHtml") ?? ""),
    });
    setLoading(false);
    setSaved(true);
  }

  return (
    <FormCard
      title="Özel kod alanları"
      description="Analitik, doğrulama veya özel CSS."
      Icon={Code2}
      className="max-w-3xl"
    >
      <form onSubmit={clientFormSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldGroup label="Head içi kod" htmlFor="customHeadHtml">
          <Textarea
            id="customHeadHtml"
            name="customHeadHtml"
            rows={8}
            defaultValue={customHeadHtml}
            placeholder="<!-- meta, CSS, doğrulama etiketleri -->"
            className="font-mono text-xs"
          />
        </FieldGroup>
        <FieldGroup label="Sayfa sonu kod" htmlFor="customBodyEndHtml">
          <Textarea
            id="customBodyEndHtml"
            name="customBodyEndHtml"
            rows={8}
            defaultValue={customBodyEndHtml}
            placeholder="<!-- analitik, pixel -->"
            className="font-mono text-xs"
          />
        </FieldGroup>
        <FieldHint>Bu alanlar ham HTML basar. Yalnızca güvendiğiniz kodları ekleyin.</FieldHint>
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
