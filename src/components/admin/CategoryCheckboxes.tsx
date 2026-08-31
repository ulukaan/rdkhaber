"use client";

import { useState } from "react";
import { FieldHint } from "@/components/admin/FormCard";

type CategoryOption = { id: string; name: string };

export function CategoryCheckboxes({
  categories,
  defaultIds = [],
}: {
  categories: CategoryOption[];
  defaultIds?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(() => {
    const known = new Set(categories.map((c) => c.id));
    const seen = new Set<string>();
    const ids: string[] = [];
    for (const id of defaultIds) {
      if (!id || !known.has(id) || seen.has(id)) continue;
      seen.add(id);
      ids.push(id);
    }
    return ids;
  });

  const primaryId = selected[0] ?? "";

  function toggle(id: string) {
    setSelected((current) => {
      if (current.includes(id)) return current.filter((x) => x !== id);
      return [...current, id];
    });
  }

  function makePrimary(id: string) {
    setSelected((current) => {
      if (!current.includes(id)) return current;
      return [id, ...current.filter((x) => x !== id)];
    });
  }

  return (
    <div>
      {selected.map((id) => (
        <input key={id} type="hidden" name="categoryIds" value={id} />
      ))}
      <ul className="max-h-56 space-y-0.5 overflow-y-auto rounded-lg border border-border bg-white p-1.5">
        {categories.map((c) => {
          const checked = selected.includes(c.id);
          const isPrimary = checked && c.id === primaryId;
          return (
            <li key={c.id} className="flex items-center gap-1">
              <label className="flex min-h-10 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(c.id)}
                  className="h-4 w-4 shrink-0 accent-[var(--brand)]"
                />
                <span className="min-w-0 flex-1 font-medium text-ink">{c.name}</span>
              </label>
              {isPrimary ? (
                <span className="mr-1 rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-brand">
                  Ana
                </span>
              ) : checked ? (
                <button
                  type="button"
                  onClick={() => makePrimary(c.id)}
                  className="mr-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-soft hover:bg-surface hover:text-ink"
                >
                  Ana yap
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
      <FieldHint>
        Birden fazla seçebilirsiniz. İlk işaretlediğiniz (veya Ana yaptığınız) kategori rozet ve rengi belirler.
      </FieldHint>
    </div>
  );
}
