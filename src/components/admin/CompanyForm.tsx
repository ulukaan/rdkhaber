"use client";

import { clientFormSubmit } from "@/lib/client-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { createCompanyAction, updateCompanyAction } from "@/actions/company";
import { FieldGroup, Input, Textarea } from "@/components/ui/FormField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";
import { FormCard, FieldHint } from "@/components/admin/FormCard";
import { FormActions } from "@/components/admin/PanelUI";

type Defaults = {
  id?: string;
  name?: string;
  logoUrl?: string;
  websiteUrl?: string;
  category?: string;
  phone?: string | null;
  description?: string | null;
  order?: number;
  active?: boolean;
};

export function CompanyForm({ defaults }: { defaults?: Defaults }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(defaults?.id);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const raw = {
      name: String(formData.get("name") ?? ""),
      logoUrl: String(formData.get("logoUrl") ?? ""),
      websiteUrl: String(formData.get("websiteUrl") ?? ""),
      category: String(formData.get("category") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      description: String(formData.get("description") ?? ""),
      order: Number(formData.get("order") ?? 0),
      active: formData.get("active") === "on",
    };
    const result = isEdit
      ? await updateCompanyAction(defaults!.id!, raw)
      : await createCompanyAction(raw);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/firmalar");
  };

  return (
    <FormCard
      title={isEdit ? "Firmayı düzenle" : "Yeni firma"}
      description="Logo, unvan ve faaliyet alanı ana sayfa vitrininde görünür."
      Icon={Building2}
      className="max-w-xl"
    >
      <form onSubmit={clientFormSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldGroup label="Firma adı" htmlFor="name">
          <Input
            id="name"
            name="name"
            required
            defaultValue={defaults?.name ?? ""}
            placeholder="Örn. Petrol Ofisi"
          />
        </FieldGroup>

        <FieldGroup label="Faaliyet alanı" htmlFor="category">
          <Input
            id="category"
            name="category"
            defaultValue={defaults?.category ?? ""}
            placeholder="Örn. PETROL, GİYİM, YAZILIM"
          />
          <FieldHint>Kısa kategori; vitrinde logo altında büyük harfle gösterilir.</FieldHint>
        </FieldGroup>

        <FieldGroup label="Firma logosu" htmlFor="logoUrl">
          <ImageUploadField name="logoUrl" defaultValue={defaults?.logoUrl ?? ""} />
        </FieldGroup>

        <FieldGroup label="Web sitesi" htmlFor="websiteUrl">
          <Input
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            defaultValue={defaults?.websiteUrl ?? ""}
            placeholder="https://..."
          />
        </FieldGroup>

        <FieldGroup label="Telefon" htmlFor="phone">
          <Input
            id="phone"
            name="phone"
            defaultValue={defaults?.phone ?? ""}
            placeholder="0xxx xxx xx xx"
          />
        </FieldGroup>

        <FieldGroup label="Açıklama" htmlFor="description">
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={defaults?.description ?? ""}
            placeholder="İsteğe bağlı kısa tanıtım"
          />
        </FieldGroup>

        <FieldGroup label="Sıra" htmlFor="order">
          <Input
            id="order"
            name="order"
            type="number"
            min={0}
            defaultValue={defaults?.order ?? 0}
          />
          <FieldHint>Küçük sayı önce görünür.</FieldHint>
        </FieldGroup>

        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            name="active"
            defaultChecked={defaults?.active ?? true}
            className="h-4 w-4 rounded border-border"
          />
          Vitrinde yayınla
        </label>

        {error ? <p className="text-sm font-semibold text-brand">{error}</p> : null}

        <FormActions>
          <Button type="submit" disabled={loading}>
            {loading ? "Kaydediliyor…" : isEdit ? "Güncelle" : "Kaydet"}
          </Button>
          <Button variant="outline" href="/admin/firmalar">
            İptal
          </Button>
        </FormActions>
      </form>
    </FormCard>
  );
}
