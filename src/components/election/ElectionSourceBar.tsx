import { formatDate } from "@/lib/utils";
import type { SnapshotKind } from "@prisma/client";

const KIND_LABELS: Record<SnapshotKind, string> = {
  PROVISIONAL: "Ön sonuç",
  UPDATED: "Güncellenen sonuç",
  FINAL: "Kesin sonuç",
};

export function ElectionSourceBar({
  sourceName,
  sourceUrl,
  importedAt,
  kind,
  verified,
}: {
  sourceName: string;
  sourceUrl?: string | null;
  importedAt: Date | string;
  kind: SnapshotKind;
  verified: boolean;
}) {
  const when = formatDate(new Date(importedAt));
  const statusLabel = verified ? KIND_LABELS.FINAL : KIND_LABELS[kind];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border border-brand/15 bg-brand/[0.05] px-3 py-2 text-[11px] text-ink-soft sm:px-4">
      <p>
        Kaynak:{" "}
        {sourceUrl ? (
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand hover:underline">
            {sourceName}
          </a>
        ) : (
          <span className="font-semibold text-ink">{sourceName}</span>
        )}
        {" · "}
        İçe aktarım: <span className="font-semibold text-ink">{when}</span>
      </p>
      <p className="font-bold uppercase tracking-wide text-ink">
        {verified ? (
          <span className="text-brand">✓ {statusLabel}</span>
        ) : (
          <span className="text-amber-700">{statusLabel} — resmî doğrulama bekleniyor</span>
        )}
      </p>
    </div>
  );
}
