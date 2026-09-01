"use client";

import { clientFormSubmit } from "@/lib/client-form";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createNewsletterCampaignAction,
  fillCampaignFromNewsAction,
  fillCampaignFromArticleAction,
  updateNewsletterCampaignAction,
} from "@/actions/newsletter";
import { FieldGroup, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { PanelFormFooter, PANEL_FORM_BOTTOM_PAD } from "@/components/admin/PanelFormFooter";
import { cn } from "@/lib/utils";

export function NewsletterCampaignForm({
  defaults,
  articles = [],
}: {
  defaults?: { id: string; subject: string; preheader?: string | null; content: string };
  articles?: Array<{ id: string; title: string }>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [digest, setDigest] = useState(defaults?.content ?? "");
  const [digestKey, setDigestKey] = useState(0);
  const [filling, setFilling] = useState(false);
  const [articleId, setArticleId] = useState(articles[0]?.id ?? "");
  const [subject, setSubject] = useState(defaults?.subject ?? "");
  const [preheader, setPreheader] = useState(defaults?.preheader ?? "");

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const raw = {
      subject: String(formData.get("subject") ?? ""),
      preheader: String(formData.get("preheader") ?? ""),
      content: String(formData.get("content") ?? ""),
    };
    const result = defaults?.id
      ? await updateNewsletterCampaignAction(defaults.id, raw)
      : await createNewsletterCampaignAction(raw);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    const id = defaults?.id ?? ("id" in result ? result.id : undefined);
    if (!id) {
      setError("Kayıt tamamlanamadı.");
      return;
    }
    router.push(`/admin/bulten/${id}`);
    router.refresh();
  };

  const fillNews = async () => {
    setFilling(true);
    const result = await fillCampaignFromNewsAction();
    setFilling(false);
    if (result.content) {
      setDigest(result.content);
      setDigestKey((k) => k + 1);
    }
  };

  const fillArticle = async () => {
    if (!articleId) return;
    setFilling(true);
    const result = await fillCampaignFromArticleAction(articleId);
    setFilling(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.content) {
      setDigest(result.content);
      setDigestKey((k) => k + 1);
    }
    if (result.subject) setSubject(result.subject);
    if (result.preheader) setPreheader(result.preheader);
  };

  return (
    <form onSubmit={clientFormSubmit(onSubmit)} className={cn("flex max-w-3xl flex-col gap-4", PANEL_FORM_BOTTOM_PAD)}>
      <FieldGroup label="Konu" htmlFor="nl-subject">
        <Input
          id="nl-subject"
          name="subject"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Düzce'den bugünün başlıkları"
        />
      </FieldGroup>
      <FieldGroup label="Kısa ön izleme (isteğe bağlı)" htmlFor="nl-pre">
        <Input
          id="nl-pre"
          name="preheader"
          value={preheader}
          onChange={(e) => setPreheader(e.target.value)}
          placeholder="Gelen kutusunda konunun altında görünür"
        />
      </FieldGroup>
      {articles.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface/50 p-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="nl-article-pick" className="mb-1 block text-sm font-semibold text-ink">
              Tek haberden doldur
            </label>
            <select
              id="nl-article-pick"
              value={articleId}
              onChange={(e) => setArticleId(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              {articles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={fillArticle} disabled={filling || !articleId}>
            {filling ? "Hazırlanıyor..." : "Haberi yerleştir"}
          </Button>
        </div>
      ) : null}
      <div>
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="text-sm font-semibold text-ink">Bülten metni</label>
          <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={fillNews} disabled={filling}>
            {filling ? "Hazırlanıyor..." : "Son haberlerden doldur"}
          </Button>
        </div>
        <RichTextEditor
          key={digestKey}
          name="content"
          defaultValue={digest}
          placeholder="Bülteninizi yazın veya son haberlerden doldurun."
        />
      </div>
      {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
      <PanelFormFooter>
        <Button href="/admin/bulten" variant="outline" className="w-full sm:w-auto">
          Listeye dön
        </Button>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Kaydediliyor..." : defaults?.id ? "Kaydet" : "Bülteni kaydet"}
        </Button>
      </PanelFormFooter>
    </form>
  );
}
