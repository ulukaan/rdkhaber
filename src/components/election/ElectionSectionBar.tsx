export function ElectionSectionBar({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle?: string;
  trailing?: string;
}) {
  return (
    <div className="flex flex-col gap-2 bg-brand-dark px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-wide sm:text-base">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-white/60">{subtitle}</p> : null}
      </div>
      {trailing ? (
        <p className="text-[11px] font-bold uppercase tracking-wide text-white/80 sm:text-xs">{trailing}</p>
      ) : null}
    </div>
  );
}
