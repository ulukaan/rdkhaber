"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { FieldHint } from "@/components/admin/FormCard";
import { cn } from "@/lib/utils";

type CategoryOption = { id: string; name: string };

export function CategoryCheckboxes({
  categories,
  defaultIds = [],
  defaultOpen,
}: {
  categories: CategoryOption[];
  defaultIds?: string[];
  /** Verilmezse: seçim yoksa açık, varsa kapalı. */
  defaultOpen?: boolean;
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
  const [open, setOpen] = useState(() =>
    defaultOpen !== undefined ? defaultOpen : selected.length === 0,
  );
  const [query, setQuery] = useState("");

  const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const primaryId = selected[0] ?? "";
  const selectedNames = selected
    .map((id) => byId.get(id)?.name)
    .filter((name): name is string => Boolean(name));

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    if (!q) return categories;
    return categories.filter((c) => c.name.toLocaleLowerCase("tr-TR").includes(q));
  }, [categories, query]);

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

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition-colors hover:border-brand/40"
      >
        <span className="min-w-0">
          <span className="block text-xs font-extrabold uppercase tracking-wide text-ink">
            {selected.length > 0
              ? `${selected.length} kategori seçili`
              : "Kategori seç"}
          </span>
          {!open && selectedNames.length > 0 ? (
            <span className="mt-0.5 block truncate text-[12px] text-ink-soft">
              {selectedNames.join(" · ")}
            </span>
          ) : !open ? (
            <span className="mt-0.5 block text-[12px] text-ink-soft">Listeyi açmak için tıklayın</span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-ink-soft transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="mt-2 space-y-2">
          {categories.length > 8 ? (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kategori ara…"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand"
            />
          ) : null}
          <ul className="max-h-56 space-y-0.5 overflow-y-auto rounded-lg border border-border bg-white p-1.5">
            {filtered.length === 0 ? (
              <li className="px-2 py-3 text-center text-xs text-ink-soft">Sonuç yok</li>
            ) : (
              filtered.map((c) => {
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
              })
            )}
          </ul>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs font-semibold text-ink-soft hover:text-brand"
          >
            Listeyi kapat
          </button>
        </div>
      ) : null}

      <FieldHint>
        Birden fazla seçebilirsiniz. İlk işaretlediğiniz (veya Ana yaptığınız) kategori rozet ve rengi
        belirler.
      </FieldHint>
    </div>
  );
}
