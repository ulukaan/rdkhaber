import { formatDate } from "@/lib/utils";

type Correction = {
  note: string;
  createdAt: Date | string;
  user?: { name: string } | null;
};

export function CorrectionBanner({ corrections }: { corrections: Correction[] }) {
  if (corrections.length === 0) return null;
  const latest = corrections[0];

  return (
    <aside
      className="mb-4 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
      role="note"
      aria-label="Düzeltme notu"
    >
      <p className="font-bold">Düzeltme / güncelleme</p>
      <p className="mt-1 leading-relaxed">{latest.note}</p>
      <p className="mt-2 text-xs text-amber-900/80">
        {formatDate(latest.createdAt)}
        {latest.user?.name ? ` · ${latest.user.name}` : ""}
      </p>
    </aside>
  );
}
