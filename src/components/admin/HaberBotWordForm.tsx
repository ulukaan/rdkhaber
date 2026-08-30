"use client";

import { clientFormSubmit } from "@/lib/client-form";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { createHaberBotWordAction, importHaberBotWordsAction } from "@/actions/haber-bot";
import { FieldGroup, Input, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/admin/FormCard";

export function HaberBotWordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkOk, setBulkOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const onAdd = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const result = await createHaberBotWordAction({
      find: String(formData.get("find") ?? ""),
      replace: String(formData.get("replace") ?? ""),
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    (document.getElementById("haber-bot-word-form") as HTMLFormElement | null)?.reset();
    router.refresh();
  };

  const onBulk = async (formData: FormData) => {
    setBulkLoading(true);
    setBulkError(null);
    setBulkOk(null);
    const result = await importHaberBotWordsAction(String(formData.get("template") ?? ""));
    setBulkLoading(false);
    if (result?.error) {
      setBulkError(result.error);
      return;
    }
    setBulkOk(`${"total" in result ? result.total : 0} satır işlendi.`);
    (document.getElementById("haber-bot-word-bulk") as HTMLFormElement | null)?.reset();
    router.refresh();
  };

  return (
    <FormCard
      title="Kelime değişimi"
      description="Haber çekilirken metindeki kelimeler burada yazdığınız karşılıkla değişir."
      Icon={Languages}
    >
      <form id="haber-bot-word-form" onSubmit={clientFormSubmit(onAdd)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <FieldGroup label="Eski kelime" htmlFor="bot-find">
            <Input id="bot-find" name="find" placeholder="abartı" required />
          </FieldGroup>
        </div>
        <div className="flex-1">
          <FieldGroup label="Yeni kelime" htmlFor="bot-replace">
            <Input id="bot-replace" name="replace" placeholder="mübalağa" />
          </FieldGroup>
        </div>
        <Button type="submit" disabled={loading} className="shrink-0">
          {loading ? "Ekleniyor..." : "Ekle"}
        </Button>
      </form>
      {error ? <p className="mt-2 text-sm font-medium text-brand">{error}</p> : null}

      <form id="haber-bot-word-bulk" onSubmit={clientFormSubmit(onBulk)} className="mt-6 border-t border-border pt-5">
        <FieldGroup label="Kalıp yapıştır" htmlFor="bot-template">
          <Textarea
            id="bot-template"
            name="template"
            rows={6}
            placeholder={"abartı => mübalağa\nAA | Anadolu Ajansı\nIHA yerine İhlas Haber Ajansı"}
          />
        </FieldGroup>
        <p className="mt-1 text-xs text-ink-soft">
          Her satır bir kural: eski =&gt; yeni, eski | yeni, sekme ile veya eski yerine yeni.
        </p>
        {bulkError ? <p className="mt-2 text-sm font-medium text-brand">{bulkError}</p> : null}
        {bulkOk ? <p className="mt-2 text-sm font-medium text-emerald-700">{bulkOk}</p> : null}
        <Button type="submit" variant="outline" disabled={bulkLoading} className="mt-3">
          {bulkLoading ? "İşleniyor..." : "Kalıbı ekle"}
        </Button>
      </form>
    </FormCard>
  );
}
