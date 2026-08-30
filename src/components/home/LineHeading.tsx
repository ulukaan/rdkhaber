import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function LineHeading({
  title,
  href,
  className,
  accent,
  as: Tag = "h2",
}: {
  title: string;
  href?: string;
  className?: string;
  accent?: string | null;
  as?: "h1" | "h2";
}) {
  const color = accent || "var(--brand)";

  return (
    <div
      className={cn("mb-4 flex items-center gap-3", className)}
      style={{ ["--line-accent" as string]: color }}
    >
      <Tag
        className="relative shrink-0 bg-[var(--line-accent)] py-1.5 pl-3.5 pr-5 text-[13px] font-black uppercase tracking-[0.14em] text-white shadow-sm md:text-sm"
        style={{
          clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)",
        }}
      >
        {title}
      </Tag>

      <div className="relative min-w-0 flex-1">
        <div className="h-px w-full bg-border" />
        <div className="absolute inset-y-0 left-0 h-px w-16 bg-[var(--line-accent)] opacity-90 md:w-28" aria-hidden />
      </div>

      {href ? (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-[var(--line-accent)] hover:bg-[var(--line-accent)] hover:text-white"
          aria-label={`${title} — tümünü gör`}
        >
          Tümü
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--line-accent)]" aria-hidden />
      )}
    </div>
  );
}
