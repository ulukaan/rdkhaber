"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import {
  PanelDesktopOnly,
  PanelMobileCard,
  PanelMobileCardBody,
  PanelMobileEmpty,
  PanelMobileList,
  PanelMobileOnly,
} from "@/components/admin/PanelMobileList";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime } from "@/lib/utils";
import {
  clearHaberBotLogsAction,
  deleteHaberBotLogAction,
  deleteHaberBotLogsAction,
} from "@/actions/haber-bot";

export type HaberBotLogRow = {
  id: string;
  title: string;
  status: string;
  message: string | null;
  articleId: string | null;
  sourceName: string | null;
  createdAt: string;
};

const LOG_LABEL: Record<string, { text: string; variant: "brand" | "outline" | "dark" }> = {
  imported: { text: "Eklendi", variant: "brand" },
  skipped: { text: "Atlandı", variant: "outline" },
  error: { text: "Hata", variant: "dark" },
};

function logNotes(message: string | null) {
  if (!message) return { note: null as string | null, words: "—" };
  const changed = message.match(/(\d+)\s+kelime değişti/);
  if (changed) {
    return {
      note: message.replace(/\s*·\s*\d+\s+kelime değişti/, "").trim() || null,
      words: `${changed[1]} kelime`,
    };
  }
  if (message.includes("kelime değişmedi")) {
    return {
      note: message.replace(/\s*·\s*kelime değişmedi/, "").trim() || null,
      words: "0 kelime",
    };
  }
  return { note: message, words: "—" };
}

export function HaberBotLogsPanel({ logs }: { logs: HaberBotLogRow[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const allIds = useMemo(() => logs.map((l) => l.id), [logs]);
  const allSelected = allIds.length > 0 && selected.length === allIds.length;
  const selectedHasArticle = logs.some((l) => selected.includes(l.id) && l.articleId);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleAll() {
    setSelected(allSelected ? [] : allIds);
  }

  function runSelected() {
    if (selected.length === 0) return;
    const confirmText = selectedHasArticle
      ? `${selected.length} kayıt silinecek. Eklendi işaretli olanların haberleri de silinir.`
      : `${selected.length} kayıt silinecek.`;
    if (!window.confirm(confirmText)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteHaberBotLogsAction(selected);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setSelected([]);
    });
  }

  function runClearAll() {
    if (logs.length === 0) return;
    if (
      !window.confirm(
        "Tüm çekim kaydı silinecek. Eklendi olan haberler de silinir. Emin misiniz?",
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      await clearHaberBotLogsAction();
      setSelected([]);
    });
  }

  return (
    <>
      {logs.length > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending || selected.length === 0}
            onClick={runSelected}
          >
            {pending ? "Siliniyor…" : `Seçilenleri sil${selected.length ? ` (${selected.length})` : ""}`}
          </Button>
          <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={runClearAll}>
            Tümünü sil
          </Button>
          {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
        </div>
      ) : null}

      <PanelMobileOnly>
        {logs.length === 0 ? (
          <PanelMobileEmpty>Henüz çekim yok.</PanelMobileEmpty>
        ) : (
          <PanelMobileList>
            {logs.map((log) => {
              const badge = LOG_LABEL[log.status] ?? LOG_LABEL.error;
              const { note, words } = logNotes(log.message);
              return (
                <PanelMobileCard key={log.id}>
                  <PanelMobileCardBody
                    footer={
                      <div className="flex items-center justify-between gap-2">
                        <label className="inline-flex items-center gap-2 text-xs font-semibold text-ink-soft">
                          <input
                            type="checkbox"
                            checked={selected.includes(log.id)}
                            onChange={() => toggle(log.id)}
                            className="h-4 w-4 accent-brand"
                          />
                          Seç
                        </label>
                        <DeleteButton
                          id={log.id}
                          action={deleteHaberBotLogAction}
                          confirmText="Bu kayıt ve eklenen haber silinsin mi?"
                        />
                      </div>
                    }
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant={badge.variant}>{badge.text}</Badge>
                      <span className="text-[11px] text-ink-soft">
                        {formatRelativeTime(log.createdAt)}
                      </span>
                    </div>
                    {log.articleId ? (
                      <Link
                        href={`/admin/makaleler/${log.articleId}`}
                        className="text-sm font-semibold text-ink hover:text-brand"
                      >
                        {log.title}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium text-ink">{log.title}</p>
                    )}
                    {note ? (
                      <p className="mt-1 text-xs text-ink-soft">{note}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-ink-soft">
                      {log.sourceName ?? "—"} · {words}
                    </p>
                  </PanelMobileCardBody>
                </PanelMobileCard>
              );
            })}
          </PanelMobileList>
        )}
      </PanelMobileOnly>

      <PanelDesktopOnly>
        <Table>
          <thead>
            <tr>
              <Th className="w-10">
                <input
                  type="checkbox"
                  aria-label="Tümünü seç"
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={logs.length === 0}
                  className="h-4 w-4 accent-brand"
                />
              </Th>
              <Th>Haber</Th>
              <Th>Kaynak</Th>
              <Th>Kelime</Th>
              <Th>Sonuç</Th>
              <Th>Zaman</Th>
              <Th className="text-right">İşlem</Th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <EmptyRow colSpan={7}>Henüz çekim yok.</EmptyRow>
            ) : (
              logs.map((log) => {
                const badge = LOG_LABEL[log.status] ?? LOG_LABEL.error;
                const { note, words } = logNotes(log.message);
                return (
                  <tr key={log.id} className={selected.includes(log.id) ? "bg-brand/[0.03]" : undefined}>
                    <Td>
                      <input
                        type="checkbox"
                        aria-label={`${log.title} seç`}
                        checked={selected.includes(log.id)}
                        onChange={() => toggle(log.id)}
                        className="h-4 w-4 accent-brand"
                      />
                    </Td>
                    <Td className="max-w-sm">
                      {log.articleId ? (
                        <Link
                          href={`/admin/makaleler/${log.articleId}`}
                          className="font-semibold text-ink hover:text-brand"
                        >
                          {log.title}
                        </Link>
                      ) : (
                        <span className="font-medium text-ink">{log.title}</span>
                      )}
                      {note ? (
                        <div className="mt-0.5 text-xs text-ink-soft">{note}</div>
                      ) : null}
                    </Td>
                    <Td className="text-ink-soft">{log.sourceName ?? "—"}</Td>
                    <Td className="whitespace-nowrap text-xs font-semibold text-ink">{words}</Td>
                    <Td>
                      <Badge variant={badge.variant}>{badge.text}</Badge>
                    </Td>
                    <Td className="whitespace-nowrap text-xs text-ink-soft">
                      {formatRelativeTime(log.createdAt)}
                    </Td>
                    <Td>
                      <div className="flex justify-end">
                        <DeleteButton
                          id={log.id}
                          action={deleteHaberBotLogAction}
                          confirmText="Bu kayıt ve eklenen haber silinsin mi?"
                        />
                      </div>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </PanelDesktopOnly>
    </>
  );
}
