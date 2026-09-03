"use client";

import { useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PanelCard } from "@/components/admin/PanelUI";

/**
 * Panel formlarında konu başlıklarını gruplayan kart.
 * Uzun ayar listelerini okunabilir bölümlere ayırmak için kullanılır.
 */
export function FormCard({
  title,
  description,
  Icon,
  children,
  className,
  id,
  collapsible = false,
  defaultOpen = true,
}: {
  title: string;
  description?: string;
  Icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  id?: string;
  /** Başlıktan aç/kapa. */
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <PanelCard id={id} padding={false} className={className}>
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left sm:px-5 sm:py-4"
        >
          {Icon ? (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Icon className="h-4 w-4" />
            </span>
          ) : null}
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-ink">{title}</span>
            {description ? (
              <span className="mt-0.5 block text-xs text-ink-soft">{description}</span>
            ) : null}
          </span>
          <ChevronDown
            className={cn(
              "mt-1 h-4 w-4 shrink-0 text-ink-soft transition-transform",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      ) : (
        <header className="flex items-start gap-3 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
          {Icon ? (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Icon className="h-4 w-4" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-ink">{title}</h3>
            {description ? <p className="mt-0.5 text-xs text-ink-soft">{description}</p> : null}
          </div>
        </header>
      )}
      {(!collapsible || open) && <div className="p-4 sm:p-5">{children}</div>}
    </PanelCard>
  );
}

/** Kart içinde iki sütunlu alan ızgarası. */
export function FieldGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2", className)}>{children}</div>
  );
}

/** Alanın altına açıklama satırı ekler. */
export function FieldHint({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs text-ink-soft">{children}</p>;
}
