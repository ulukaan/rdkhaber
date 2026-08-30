"use client";

import { cn } from "@/lib/utils";

/** Panel genelinde tek tip açık/kapalı anahtarı. */
export function StatusToggle({
  active,
  onLabel = "Aktif",
  offLabel = "Pasif",
  pendingLabel = "...",
  disabled,
  onClick,
  title,
}: {
  active: boolean;
  onLabel?: string;
  offLabel?: string;
  pendingLabel?: string;
  disabled?: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={title}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide transition disabled:opacity-50",
        active
          ? "bg-brand text-white hover:bg-brand-dark"
          : "border border-border bg-surface text-ink-soft hover:border-ink/30 hover:text-ink",
      )}
    >
      {disabled ? pendingLabel : active ? onLabel : offLabel}
    </button>
  );
}
