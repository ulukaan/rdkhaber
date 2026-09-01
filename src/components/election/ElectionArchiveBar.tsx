import { formatDate } from "@/lib/utils";

export function ElectionArchiveBar({
  title,
  electionDate,
}: {
  title: string;
  electionDate?: Date | string | null;
}) {
  const when =
    electionDate != null && electionDate !== ""
      ? formatDate(new Date(electionDate))
      : null;

  return (
    <div className="border-b border-amber-200/80 bg-amber-50 px-3 py-2.5 text-center text-xs text-amber-950 sm:px-4 sm:text-sm">
      <p className="font-bold">
        {when ? `${when} — ` : ""}
        {title}
      </p>
      <p className="mt-0.5 text-[11px] font-medium text-amber-800/90 sm:text-xs">
        Arşiv sonuçları — canlı seçim yayını şu an aktif değil
      </p>
    </div>
  );
}
