"use client";

import { useState, useTransition } from "react";
import { HeadlineFace, type HeadlineAlign } from "@/components/news/HeadlineFace";
import { Button } from "@/components/ui/Button";
import { saveHeadlineDesignAction } from "@/actions/article";

export function HeadlineDesignForm({
  articleId,
  coverImageUrl,
  color,
  defaults,
  cancelHref,
}: {
  articleId: string;
  coverImageUrl: string | null;
  color: string | null;
  cancelHref: string;
  defaults: {
    kicker: string;
    title: string;
    sub: string;
    align: HeadlineAlign;
    imageAlign: HeadlineAlign;
  };
}) {
  const [kicker, setKicker] = useState(defaults.kicker);
  const [title, setTitle] = useState(defaults.title);
  const [sub, setSub] = useState(defaults.sub);
  const [align, setAlign] = useState<HeadlineAlign>(defaults.align);
  const [imageAlign, setImageAlign] = useState<HeadlineAlign>(defaults.imageAlign);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function save() {
    setError(null);
    start(async () => {
      const result = await saveHeadlineDesignAction(articleId, {
        headlineKicker: kicker,
        headlineTitle: title,
        headlineSub: sub,
        headlineAlign: align,
        headlineImageAlign: imageAlign,
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
        <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
          Yazı yönü
          <select
            value={align}
            onChange={(e) => setAlign(e.target.value as HeadlineAlign)}
            className="rounded border border-border bg-white px-2 py-1 text-xs font-semibold text-ink"
          >
            <option value="left">Sol</option>
            <option value="center">Orta</option>
            <option value="right">Sağ</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
          Resim yönü
          <select
            value={imageAlign}
            onChange={(e) => setImageAlign(e.target.value as HeadlineAlign)}
            className="rounded border border-border bg-white px-2 py-1 text-xs font-semibold text-ink"
          >
            <option value="left">Sol</option>
            <option value="center">Orta</option>
            <option value="right">Sağ</option>
          </select>
        </label>
        <div className="ml-auto flex gap-2">
          <Button type="button" size="sm" onClick={save} disabled={pending}>
            {pending ? "Kaydediliyor…" : "Kaydet"}
          </Button>
          <Button href={cancelHref} size="sm" variant="outline">
            İptal
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-brand">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <HeadlineFace
          title={title || "Ana başlık"}
          kicker={kicker}
          sub={sub}
          coverImageUrl={coverImageUrl}
          color={color}
          align={align}
          imageAlign={imageAlign}
          size="lg"
          className="min-h-[280px] md:min-h-[380px]"
        />
        <div className="flex flex-col gap-3">
          <label className="block text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">
            Üst başlık
            <input
              value={kicker}
              onChange={(e) => setKicker(e.target.value)}
              className="mt-1 w-full border border-border px-3 py-2 text-sm font-semibold text-ink"
            />
          </label>
          <label className="block text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">
            Ana başlık
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={4}
              className="mt-1 w-full border border-border px-3 py-2 text-sm font-extrabold text-ink"
            />
          </label>
          <label className="block text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">
            Alt başlık
            <textarea
              value={sub}
              onChange={(e) => setSub(e.target.value)}
              rows={3}
              className="mt-1 w-full border border-border px-3 py-2 text-sm text-ink"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
