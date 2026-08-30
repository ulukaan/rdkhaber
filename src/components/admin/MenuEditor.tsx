"use client";

import { useId, useState, useTransition } from "react";
import {
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormField";
import { FormCard } from "@/components/admin/FormCard";
import { FormActions } from "@/components/admin/PanelUI";
import { saveNavMenuAction, resetNavMenuAction } from "@/actions/appearance";
import type { NavEditItem, NavLocation } from "@/lib/nav-menu";
import { cn } from "@/lib/utils";

type Row = NavEditItem & { key: string };

function newKey() {
  return `n-${Math.random().toString(36).slice(2, 10)}`;
}

function toRows(items: NavEditItem[]): Row[] {
  return items.map((item) => ({
    key: newKey(),
    label: item.label,
    href: item.href,
    visible: item.visible,
    children: (item.children ?? []).map((child) => ({
      key: newKey(),
      label: child.label,
      href: child.href,
      visible: child.visible,
    })),
  }));
}

function toPayload(rows: Row[]): NavEditItem[] {
  return rows.map((row) => ({
    label: row.label,
    href: row.href,
    visible: row.visible,
    children: (row.children as Row[] | undefined)?.map((child) => ({
      label: child.label,
      href: child.href,
      visible: child.visible,
    })),
  }));
}

export function MenuEditor({
  location,
  initial,
  title,
  description,
}: {
  location: NavLocation;
  initial: NavEditItem[];
  title: string;
  description: string;
}) {
  const [rows, setRows] = useState(() => toRows(initial));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const formId = useId();

  function updateParent(index: number, patch: Partial<Row>) {
    setSaved(false);
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function updateChild(parentIndex: number, childIndex: number, patch: Partial<Row>) {
    setSaved(false);
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== parentIndex) return row;
        const children = [...((row.children as Row[]) ?? [])];
        children[childIndex] = { ...children[childIndex]!, ...patch };
        return { ...row, children };
      }),
    );
  }

  function moveParent(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= rows.length) return;
    setSaved(false);
    setRows((prev) => {
      const copy = [...prev];
      const tmp = copy[index]!;
      copy[index] = copy[next]!;
      copy[next] = tmp;
      return copy;
    });
  }

  function moveChild(parentIndex: number, childIndex: number, dir: -1 | 1) {
    setSaved(false);
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== parentIndex) return row;
        const children = [...((row.children as Row[]) ?? [])];
        const next = childIndex + dir;
        if (next < 0 || next >= children.length) return row;
        const tmp = children[childIndex]!;
        children[childIndex] = children[next]!;
        children[next] = tmp;
        return { ...row, children };
      }),
    );
  }

  function addParent() {
    setSaved(false);
    setRows((prev) => [
      ...prev,
      { key: newKey(), label: "Yeni menü", href: "/", visible: true, children: [] },
    ]);
  }

  function addChild(parentIndex: number) {
    setSaved(false);
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== parentIndex) return row;
        return {
          ...row,
          children: [
            ...((row.children as Row[]) ?? []),
            { key: newKey(), label: "Alt sayfa", href: "/", visible: true },
          ],
        };
      }),
    );
  }

  function removeParent(index: number) {
    setSaved(false);
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function removeChild(parentIndex: number, childIndex: number) {
    setSaved(false);
    setRows((prev) =>
      prev.map((row, i) => {
        if (i !== parentIndex) return row;
        return {
          ...row,
          children: ((row.children as Row[]) ?? []).filter((_, j) => j !== childIndex),
        };
      }),
    );
  }

  function save() {
    setError(null);
    setSaved(false);
    start(async () => {
      const result = await saveNavMenuAction({ location, items: toPayload(rows) });
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  function reset() {
    setError(null);
    start(async () => {
      const result = await resetNavMenuAction(location);
      if (result?.error) {
        setError(result.error);
        return;
      }
      window.location.reload();
    });
  }

  return (
    <FormCard title={title} description={description}>
      <div className="space-y-3" id={formId}>
        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 px-4 py-10 text-center">
            <p className="text-sm font-semibold text-ink">Henüz menü öğesi yok</p>
            <p className="mt-1 text-xs text-ink-soft">
              Üst menü satırı veya alt sayfa ekleyerek başlayın.
            </p>
          </div>
        ) : (
          rows.map((row, index) => {
            const children = (row.children as Row[]) ?? [];
            return (
              <div
                key={row.key}
                className="overflow-hidden rounded-xl border border-border bg-surface/40"
              >
                <div className="flex flex-col gap-3 bg-white p-4 sm:flex-row sm:items-start">
                  <div className="flex shrink-0 flex-col gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => moveParent(index, -1)}
                      disabled={index === 0}
                      className="rounded-md p-1 text-ink-soft hover:bg-surface hover:text-ink disabled:opacity-30"
                      aria-label="Yukarı"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveParent(index, 1)}
                      disabled={index === rows.length - 1}
                      className="rounded-md p-1 text-ink-soft hover:bg-surface hover:text-ink disabled:opacity-30"
                      aria-label="Aşağı"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                        Etiket
                      </span>
                      <Input
                        value={row.label}
                        onChange={(e) => updateParent(index, { label: e.target.value })}
                        placeholder="Menü adı"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                        Bağlantı
                      </span>
                      <Input
                        value={row.href}
                        onChange={(e) => updateParent(index, { href: e.target.value })}
                        placeholder="/gundem"
                      />
                    </label>
                  </div>

                  <div className="flex shrink-0 items-center gap-1 sm:pt-6">
                    <button
                      type="button"
                      onClick={() => updateParent(index, { visible: !row.visible })}
                      className={cn(
                        "rounded-md p-2 transition-colors",
                        row.visible
                          ? "text-emerald-700 hover:bg-emerald-50"
                          : "text-ink-soft hover:bg-surface",
                      )}
                      title={row.visible ? "Görünür" : "Gizli"}
                      aria-label={row.visible ? "Gizle" : "Göster"}
                    >
                      {row.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => addChild(index)}
                      className="rounded-md p-2 text-ink-soft hover:bg-surface hover:text-brand"
                      title="Alt sayfa ekle"
                      aria-label="Alt sayfa ekle"
                    >
                      <CornerDownRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeParent(index)}
                      className="rounded-md p-2 text-ink-soft hover:bg-brand/10 hover:text-brand"
                      aria-label="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {children.length > 0 ? (
                  <div className="space-y-2 border-t border-border bg-surface/60 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                      Alt sayfalar · {children.length}
                    </p>
                    {children.map((child, childIndex) => (
                      <div
                        key={child.key}
                        className="flex flex-col gap-3 rounded-lg border border-border bg-white p-3 sm:flex-row sm:items-start"
                      >
                        <div className="flex items-center gap-2 text-ink-soft sm:pt-6">
                          <CornerDownRight className="h-4 w-4 shrink-0" />
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => moveChild(index, childIndex, -1)}
                              disabled={childIndex === 0}
                              className="rounded-md p-1 hover:bg-surface hover:text-ink disabled:opacity-30"
                              aria-label="Yukarı"
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveChild(index, childIndex, 1)}
                              disabled={childIndex === children.length - 1}
                              className="rounded-md p-1 hover:bg-surface hover:text-ink disabled:opacity-30"
                              aria-label="Aşağı"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                          <Input
                            value={child.label}
                            onChange={(e) =>
                              updateChild(index, childIndex, { label: e.target.value })
                            }
                            placeholder="Alt sayfa adı"
                          />
                          <Input
                            value={child.href}
                            onChange={(e) =>
                              updateChild(index, childIndex, { href: e.target.value })
                            }
                            placeholder="/sayfa/ornek"
                          />
                        </div>
                        <div className="flex shrink-0 items-center gap-1 sm:pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              updateChild(index, childIndex, { visible: !child.visible })
                            }
                            className={cn(
                              "rounded-md p-2 transition-colors",
                              child.visible
                                ? "text-emerald-700 hover:bg-emerald-50"
                                : "text-ink-soft hover:bg-surface",
                            )}
                            aria-label={child.visible ? "Gizle" : "Göster"}
                          >
                            {child.visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeChild(index, childIndex)}
                            className="rounded-md p-2 text-ink-soft hover:bg-brand/10 hover:text-brand"
                            aria-label="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="border-t border-border bg-white px-4 py-2">
                  <button
                    type="button"
                    onClick={() => addChild(index)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-brand"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Alt sayfa ekle
                  </button>
                </div>
              </div>
            );
          })
        )}

        <FormActions className="pt-2">
          <Button type="button" variant="outline" size="sm" onClick={addParent}>
            <Plus className="h-4 w-4" /> Menü ekle
          </Button>
          <Button type="button" size="sm" onClick={save} disabled={pending}>
            {pending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={reset} disabled={pending}>
            Varsayılana dön
          </Button>
          {saved ? (
            <span className="text-sm font-medium text-emerald-700">Kaydedildi.</span>
          ) : null}
        </FormActions>
        {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
      </div>
    </FormCard>
  );
}
