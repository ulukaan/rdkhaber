"use client";

import { clientFormSubmit } from "@/lib/client-form";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import { createPageAction, updatePageAction } from "@/actions/page";
import { slugify } from "@/lib/slug";
import { FieldGroup, Input, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/admin/FormCard";
import { FormActions } from "@/components/admin/PanelUI";

type Defaults = {
  id?: string;
  title?: string;
  slug?: string;
  content?: string;
  published?: boolean;
};

export function PageForm({
  defaults,
  redirectTo = "/admin/sayfalar",
}: {
  defaults?: Defaults;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaults?.slug));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(defaults?.id);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const raw = {
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      content: String(formData.get("content") ?? ""),
      published: formData.get("published") === "on",
    };
    const result = isEdit
      ? await updatePageAction(defaults!.id!, raw)
      : await createPageAction(raw);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push(redirectTo);
  };

  return (
    <FormCard
      title={isEdit ? "Sayfayı düzenle" : "Yeni sayfa"}
      description="Künye, KVKK gibi sabit sayfalar."
      Icon={FileText}
      className="max-w-2xl"
    >
      <form onSubmit={clientFormSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldGroup label="Başlık" htmlFor="title">
          <Input
            id="title"
            name="title"
            defaultValue={defaults?.title}
            required
            onChange={(e) => {
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </FieldGroup>
        <FieldGroup label="Slug" htmlFor="slug">
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
        </FieldGroup>
        <FieldGroup label="İçerik" htmlFor="content">
          <Textarea
            id="content"
            name="content"
            rows={12}
            defaultValue={defaults?.content}
            required
          />
        </FieldGroup>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            name="published"
            defaultChecked={defaults?.published ?? true}
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
