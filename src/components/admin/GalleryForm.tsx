"use client";

import { clientFormSubmit } from "@/lib/client-form";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Images } from "lucide-react";
import { createGalleryAction } from "@/actions/gallery";
import { slugify } from "@/lib/slug";
import { FieldGroup, Input } from "@/components/ui/FormField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/admin/FormCard";
import { FormActions } from "@/components/admin/PanelUI";

export function GalleryForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const result = await createGalleryAction({
      title: String(formData.get("title") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/galeriler");
  };

  return (
    <FormCard
      title="Yeni galeri"
      description="Kapak görseli ve başlık ile foto galeri oluşturun."
      Icon={Images}
      className="max-w-xl"
    >
      <form onSubmit={clientFormSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldGroup label="Başlık" htmlFor="title">
          <Input
            id="title"
            name="title"
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
        <FieldGroup label="Kapak" htmlFor="coverImageUrl">
          <ImageUploadField name="coverImageUrl" />
        </FieldGroup>
        {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
        <FormActions>
          <Button type="submit" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Oluştur"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Vazgeç
          </Button>
        </FormActions>
      </form>
    </FormCard>
  );
}
