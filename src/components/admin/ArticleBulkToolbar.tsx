"use client";

import { useState, useTransition } from "react";
import type { ArticleStatus } from "@prisma/client";
import { bulkUpdateArticlesAction } from "@/actions/bulk-article";
import { Button } from "@/components/ui/Button";

export function ArticleBulkToolbar({
  selectedIds,
  onClear,
  canDelete,
}: {
  selectedIds: string[];
  onClear: () => void;
  canDelete: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (selectedIds.length === 0) return null;

  const run = (input: { status?: ArticleStatus; delete?: boolean }) => {
    setError(null);
    startTransition(async () => {
      const result = await bulkUpdateArticlesAction({ ids: selectedIds, ...input });
      if (result?.error) {
        setError(result.error);
        return;
      }
      onClear();
    });
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3">
      <span className="text-sm font-bold text-ink">{selectedIds.length} haber seçildi</span>
      <Button type="button" size="sm" disabled={pending} onClick={() => run({ status: "PUBLISHED" })}>
        Yayınla
      </Button>
      <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => run({ status: "DRAFT" })}>
        Taslak
      </Button>
      <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => run({ status: "ARCHIVED" })}>
        Arşivle
      </Button>
      {canDelete ? (
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => run({ delete: true })}>
          Sil
        </Button>
      ) : null}
      <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={onClear}>
        Seçimi temizle
      </Button>
      {error ? <p className="w-full text-sm text-brand">{error}</p> : null}
    </div>
  );
}
