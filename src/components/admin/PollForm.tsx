"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Plus, Trash2 } from "lucide-react";
import { clientFormSubmit } from "@/lib/client-form";
import { createPollAction, updatePollAction } from "@/actions/poll";
import { FieldGroup, Input, Select, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/admin/FormCard";
import { FormActions } from "@/components/admin/PanelUI";

type ArticleOption = { slug: string; title: string };

type Defaults = {
  id?: string;
  question?: string;
  description?: string;
  articleSlug?: string;
  active?: boolean;
  showResults?: boolean;
  endsAt?: string;
  options?: string[];
};

function toDatetimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function PollForm({
  defaults,
  articles = [],
}: {
  defaults?: Defaults;
  articles?: ArticleOption[];
}) {
  const router = useRouter();
  const isEdit = Boolean(defaults?.id);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<string[]>(
    defaults?.options?.length ? defaults.options : ["", ""],
  );

  const updateOption = (index: number, value: string) => {
    setOptions((current) => current.map((item, i) => (i === index ? value : item)));
  };

  const addOption = () => {
    if (options.length >= 8) return;
    setOptions((current) => [...current, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((current) => current.filter((_, i) => i !== index));
  };

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const raw = {
      question: String(formData.get("question") ?? ""),
      description: String(formData.get("description") ?? ""),
      articleSlug: String(formData.get("articleSlug") ?? ""),
      active: formData.get("active") === "on",
      showResults: formData.get("showResults") === "on",
      endsAt: String(formData.get("endsAt") ?? ""),
      options: options.map((item) => item.trim()).filter(Boolean),
    };
    const result = isEdit
      ? await updatePollAction(defaults!.id!, raw)
      : await createPollAction(raw);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/anketler");
  };

  return (
    <FormCard
      title={isEdit ? "Anketi düzenle" : "Yeni anket"}
      description="Ana sayfada veya seçtiğiniz haberde görüntülenir."
      Icon={BarChart3}
      className="max-w-2xl"
    >
      <form onSubmit={clientFormSubmit(onSubmit)} className="flex flex-col gap-4">
        <FieldGroup label="Soru" htmlFor="question">
          <Input id="question" name="question" defaultValue={defaults?.question} required />
        </FieldGroup>

        <FieldGroup label="Açıklama" htmlFor="description">
          <Textarea id="description" name="description" rows={2} defaultValue={defaults?.description} />
          <p className="mt-1 text-xs text-ink-soft">İsteğe bağlı kısa açıklama</p>
        </FieldGroup>

        <FieldGroup label="Konum" htmlFor="articleSlug">
          <Select id="articleSlug" name="articleSlug" defaultValue={defaults?.articleSlug ?? ""}>
            <option value="">Ana sayfa</option>
            {articles.map((article) => (
              <option key={article.slug} value={article.slug}>
                {article.title}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-ink-soft">Boş bırakırsanız ana sayfada gösterilir</p>
        </FieldGroup>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-ink">Seçenekler</span>
            <Button type="button" size="sm" variant="outline" onClick={addOption} disabled={options.length >= 8}>
              <Plus className="h-4 w-4" /> Seçenek ekle
            </Button>
          </div>
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Seçenek ${index + 1}`}
                required
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                disabled={options.length <= 2}
                aria-label={`Seçenek ${index + 1} sil`}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface hover:text-brand disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <FieldGroup label="Bitiş tarihi" htmlFor="endsAt">
          <Input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={toDatetimeLocal(defaults?.endsAt)}
          />
          <p className="mt-1 text-xs text-ink-soft">Boş bırakılırsa süresiz</p>
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

        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            name="showResults"
            defaultChecked={defaults?.showResults ?? true}
            className="h-4 w-4 rounded border-border"
          />
          Oy vermeden sonuçları göster
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
