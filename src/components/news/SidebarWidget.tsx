import Link from "next/link";
import { cn } from "@/lib/utils";

export function SidebarWidget({
  title,
  href,
  children,
  className,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border border-border bg-white", className)}>
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <h2 className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-ink">
          <span className="h-3.5 w-1 shrink-0 bg-brand" aria-hidden />
          {title}
        </h2>
        {href ? (
          <Link href={href} className="text-[11px] font-semibold text-ink-soft hover:text-brand">
            Tümü
          </Link>
        ) : null}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}
