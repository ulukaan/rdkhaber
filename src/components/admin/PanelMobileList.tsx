import { cn } from "@/lib/utils";

/** Mobilde kart, md+ masaüstü tablo gibi çift görünüm sarmalayıcıları. */
export function PanelMobileOnly({ children }: { children: React.ReactNode }) {
  return <div className="md:hidden">{children}</div>;
}

export function PanelDesktopOnly({ children }: { children: React.ReactNode }) {
  return <div className="hidden md:block">{children}</div>;
}

export function PanelMobileList({
  children,
  empty,
}: {
  children: React.ReactNode;
  empty?: React.ReactNode;
}) {
  return (
    <ul className="flex flex-col gap-3 md:hidden">
      {empty ?? null}
      {children}
    </ul>
  );
}

export function PanelMobileCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-white shadow-sm",
        className,
      )}
    >
      {children}
    </li>
  );
}

export function PanelMobileEmpty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-white px-4 py-12 text-center text-sm text-ink-soft md:hidden">
      {children}
    </div>
  );
}

/** Kart üst gövde + alt aksiyon şeridi. */
export function PanelMobileCardBody({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <>
      <div className="p-3">{children}</div>
      {footer ? (
        <div className="border-t border-border bg-surface/40 px-3 py-2.5">{footer}</div>
      ) : null}
    </>
  );
}
