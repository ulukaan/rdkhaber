import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionHeading({
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
  return (
    <div
      className={cn(
        "mb-4 flex items-center justify-between border-b-2 border-ink pb-2",
        className,
      )}
    >
      <Tag className="flex items-center gap-2 text-lg font-extrabold uppercase tracking-tight text-ink">
        <span
          className="h-5 w-1.5 shrink-0 bg-brand"
          style={accent ? { backgroundColor: accent } : undefined}
        />
        {title}
      </Tag>
      {href && (
        <Link
          href={href}
          className="text-xs font-semibold text-ink-soft hover:text-brand"
        >
          Tümünü Gör →
        </Link>
      )}
    </div>
  );
}
