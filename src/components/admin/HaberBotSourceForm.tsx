"use client";

import { clientFormSubmit } from "@/lib/client-form";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createHaberBotSourceAction } from "@/actions/haber-bot";
import { FieldGroup, Input, Select } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { FormCard, FieldGrid } from "@/components/admin/FormCard";
import { Rss } from "lucide-react";

export function HaberBotSourceForm({
  categories,
}: {
  categories: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const result = await createHaberBotSourceAction({
      name: String(formData.get("name") ?? ""),
      url: String(formData.get("url") ?? ""),
      categoryId: String(formData.get("categoryId") ?? ""),
      maxItems: Number(formData.get("maxItems") ?? 10),
      importStatus: String(formData.get("importStatus") ?? "DRAFT"),
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    (document.getElementById("haber-bot-source-form") as HTMLFormElement | null)?.reset();
    router.refresh();
  };

  return (
    <FormCard
      title="Kaynak site"
      description="Site ana sayfasını yazmanız yeterli. Bot RSS, WordPress ve HTML haber listesini dener."
      Icon={Rss}
    >
      <form id="haber-bot-source-form" onSubmit={clientFormSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldGrid>
          <FieldGroup label="Site adı" htmlFor="bot-name">
            <Input id="bot-name" name="name" placeholder="Anadolu Ajansı" required />
          </FieldGroup>
          <FieldGroup label="Adres" htmlFor="bot-url">
            <Input
              id="bot-url"
              name="url"
              placeholder="https://ornekhaber.com"
              required
            />
          </FieldGroup>
          <FieldGroup label="Kategori" htmlFor="bot-category">
            <Select id="bot-category" name="categoryId" required defaultValue={categories[0]?.id}>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup label="Kaç haber" htmlFor="bot-max">
            <Select id="bot-max" name="maxItems" defaultValue="10">
              <option value="5">Son 5</option>
              <option value="10">Son 10</option>
              <option value="20">Son 20</option>
              <option value="30">Son 30</option>
            </Select>
          </FieldGroup>
          <FieldGroup label="Kayıt durumu" htmlFor="bot-status">
            <Select id="bot-status" name="importStatus" defaultValue="DRAFT">
              <option value="DRAFT">Taslak (önerilen)</option>
              <option value="PUBLISHED">Doğrudan yayınla</option>
            </Select>
          </FieldGroup>
        </FieldGrid>
        {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
        <div>
          <Button type="submit" disabled={loading || categories.length === 0}>
            {loading ? "Ekleniyor..." : "Kaynak ekle"}
          </Button>
        </div>
      </form>
    </FormCard>
  );
}
