"use client";

import { useState, useTransition } from "react";
import { updateArticleCategoryAction } from "@/actions/article";
import { cn } from "@/lib/utils";

type CategoryOption = { id: string; name: string };

export function ArticleCategorySelect({
  articleId,
  categoryId,
  categories,
}: {
  articleId: string;
  categoryId: string;
  categories: CategoryOption[];
}) {
  const [value, setValue] = useState(categoryId);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    if (next === value) return;
    const previous = value;
    setValue(next);
    setError(null);
    startTransition(async () => {
      const result = await updateArticleCategoryAction(articleId, next);
      if (result?.error) {
        setValue(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div className="w-full min-w-0 sm:min-w-[9rem]">
      <select
        value={value}
        disabled={pending}
        aria-label="Kategori"
        title="Kategoriyi değiştir"
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded border border-border bg-white px-2 py-2.5 text-sm font-medium text-ink outline-none sm:max-w-[12rem] sm:py-1.5 sm:text-xs",
          "focus:border-brand focus:ring-1 focus:ring-brand/30 disabled:opacity-60",
        )}
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      {error ? <p className="mt-0.5 text-[10px] font-medium text-brand">{error}</p> : null}
    </div>
  );
}
