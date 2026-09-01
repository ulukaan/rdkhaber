import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

/** Paneldeki standart beyaz kart yüzeyi. */
export function PanelCard({
  children,
  className,
  padding = true,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-xl border border-border bg-white shadow-sm",
        padding && "p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Sayfa içi bölüm başlığı — PageHeader ile aynı marka çubuğu dili. */
export function SectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
          <span className="h-4 w-1 rounded-full bg-brand" aria-hidden />
          {title}
        </h3>
        {description ? <p className="mt-0.5 text-xs text-ink-soft">{description}</p> : null}
      </div>
      {action ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center [&_a]:justify-center [&_button]:w-full sm:[&_a]:w-auto sm:[&_button]:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}

/** Tablo dışı boş durum. */
export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <PanelCard className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-xs text-ink-soft">{description}</p> : null}
      {actionHref && actionLabel ? (
        <Button href={actionHref} size="sm" className="mt-4">
          {actionLabel}
        </Button>
      ) : null}
    </PanelCard>
  );
}

/** Form altı birincil / ikincil aksiyon satırı. */
export function FormActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-wrap items-center gap-3 pt-1", className)}>{children}</div>;
}

export type PanelSubNavLink = {
  href: string;
  label: string;
  exact?: boolean;
};

/** Bülten / görünüm gibi alt sekmeler. */
export function PanelSubNav({
  pathname,
  links,
  label,
}: {
  pathname: string;
  links: PanelSubNavLink[];
  label: string;
}) {
  return (
    <nav
      className="panel-subnav mb-6 flex gap-1 overflow-x-auto border-b border-border pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label={label}
    >
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition-colors sm:py-1.5",
              active ? "bg-brand text-white" : "text-ink-soft hover:bg-surface hover:text-ink",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Hub / kısayol kartı (Görünüm ana sayfası gibi). */
export function HubCard({
  href,
  title,
  description,
  Icon,
}: {
  href: string;
  title: string;
  description: string;
  Icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-ink">{title}</span>
        <span className="mt-1 block text-sm text-ink-soft">{description}</span>
      </span>
    </Link>
  );
}
