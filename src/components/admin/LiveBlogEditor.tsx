"use client";

import { useState, useTransition } from "react";
import { addLiveBlogUpdateAction } from "@/actions/live-blog";
import { FieldGroup, Input, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function LiveBlogEditor({ articleId }: { articleId: string }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await addLiveBlogUpdateAction({ articleId, title, body });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setTitle("");
      setBody("");
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border bg-white p-5 shadow-sm"
    >
      <h2 className="text-sm font-bold text-ink">Canlı anlatım güncellemesi</h2>
      <p className="mt-1 text-xs text-ink-soft">Gelişen haberlerde zaman damgalı satır ekleyin.</p>
      <div className="mt-4 flex flex-col gap-3">
        <FieldGroup label="Kısa başlık (isteğe bağlı)" htmlFor="live-title">
          <Input id="live-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </FieldGroup>
        <FieldGroup label="Güncelleme metni" htmlFor="live-body">
          <Textarea id="live-body" rows={4} value={body} onChange={(e) => setBody(e.target.value)} required />
        </FieldGroup>
        {error ? <p className="text-sm text-brand">{error}</p> : null}
        <Button type="submit" size="sm" disabled={pending || body.trim().length < 5}>
          {pending ? "Ekleniyor..." : "Güncelleme ekle"}
        </Button>
      </div>
    </form>
  );
}
