import { cn } from "@/lib/utils";

const variants = {
  brand: "bg-brand text-white",
  dark: "bg-ink text-white",
  outline: "border border-border text-ink-soft",
  live: "bg-brand text-white animate-pulse",
} as const;

export function Badge({
  children,
  variant = "brand",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
