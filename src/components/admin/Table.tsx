import { cn } from "@/lib/utils";

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="panel-table-scroll -mx-3 min-w-0 max-w-[calc(100%+1.5rem)] overflow-x-auto rounded-xl border border-border bg-white shadow-sm sm:mx-0 sm:max-w-full">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr:hover]:bg-surface/60">
        {children}
      </table>
    </div>
  );
}

export function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "border-b border-border bg-surface px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-ink-soft sm:px-4 sm:py-3 sm:text-[11px]",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("border-b border-border px-3 py-2.5 align-middle sm:px-4 sm:py-3", className)}>
      {children}
    </td>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-ink-soft">
        {children}
      </td>
    </tr>
  );
}
