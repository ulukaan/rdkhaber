"use client";

import { useState, useTransition } from "react";
import { addArticleCorrectionAction } from "@/actions/correction";
import { FieldGroup, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function CorrectionPanel({ articleId }: { articleId: string }) {
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await addArticleCorrectionAction({ articleId, note });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setNote("");
      setDone(true);
      window.setTimeout(() => setDone(false), 2500);
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border bg-white p-5 shadow-sm"
    >
      <h2 className="text-sm font-bold text-ink">Düzeltme notu</h2>
      <p className="mt-1 text-xs text-ink-soft">Okuyucuya görünen güncelleme/düzeltme bandı ekler.</p>
      <div className="mt-4 flex flex-col gap-3">
        <FieldGroup label="Not" htmlFor="correction-note">
          <Textarea
            id="correction-note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="14:30 — İsim düzeltildi."
            required
          />
        </FieldGroup>
        {error ? <p className="text-sm text-brand">{error}</p> : null}
        {done ? <p className="text-sm font-medium text-emerald-700">Düzeltme kaydedildi.</p> : null}
        <Button type="submit" size="sm" variant="outline" disabled={pending || note.trim().length < 5}>
          {pending ? "Kaydediliyor..." : "Düzeltme yayınla"}
        </Button>
      </div>
    </form>
  );
}
