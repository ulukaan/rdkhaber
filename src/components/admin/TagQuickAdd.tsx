"use client";

import { useState } from "react";
import { createTagAction } from "@/actions/tag";
import { slugify } from "@/lib/slug";
import { Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { FormActions } from "@/components/admin/PanelUI";

export function TagQuickAdd() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await createTagAction({ name, slug: slugify(name) });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setName("");
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <Input
        placeholder="Yeni etiket adı"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      {error && <p className="text-xs font-medium text-brand">{error}</p>}
      <FormActions>
        <Button type="submit" disabled={loading} size="sm">
          {loading ? "Ekleniyor..." : "Ekle"}
        </Button>
      </FormActions>
    </form>
  );
}
