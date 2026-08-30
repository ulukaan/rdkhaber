import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchForm({
  className,
  placeholder = "Haber, konu veya kişi ara...",
}: {
  className?: string;
  placeholder?: string;
}) {
  return (
    <form
      action="/arama"
      method="get"
      className={cn(
        "flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2.5 transition-colors focus-within:border-brand focus-within:bg-white focus-within:ring-2 focus-within:ring-brand/15",
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-ink-soft" />
      <input
        type="text"
        name="q"
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft"
      />
    </form>
  );
}
