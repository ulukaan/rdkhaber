import { cn } from "@/lib/utils";

/** Sabit form alt çubuğu — mobilde tam genişlik, masaüstünde sidebar boşluğu. */
export function PanelFormFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "panel-form-footer fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 px-3 py-3 backdrop-blur sm:px-4 lg:left-[var(--panel-sidebar-w,260px)]",
        className,
      )}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-end gap-2 sm:gap-3">
        {children}
      </div>
    </div>
  );
}

/** Sabit alt çubuğun içeriği kapatmaması için form alt boşluğu. */
export const PANEL_FORM_BOTTOM_PAD = "pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]";
