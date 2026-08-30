import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  Icon,
  href,
  highlight = false,
}: {
  label: string;
  value: number | string;
  Icon: LucideIcon;
  href?: string;
  /** Bekleyen iş varsa kartı marka rengiyle öne çıkarır. */
  highlight?: boolean;
}) {
  const active = highlight && Number(value) > 0;

  const content = (
    <div
      className={cn(
        "flex h-full items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition-all sm:gap-4 sm:p-5",
        active ? "border-brand/40 bg-brand/[0.03]" : "border-border",
        href && "group-hover:-translate-y-0.5 group-hover:border-brand/50 group-hover:shadow-md",
      )}
    >
      <span
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          active ? "bg-brand text-white" : "bg-brand/10 text-brand",
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold leading-none text-ink">{value}</p>
        <p className="mt-1.5 truncate text-xs font-semibold text-ink-soft">{label}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group block focus-visible:outline-2 focus-visible:outline-brand">
        {content}
      </Link>
    );
  }
  return content;
}
