"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, X } from "lucide-react";
import type { Role } from "@prisma/client";
import { cn } from "@/lib/utils";
import { getPanelHome, getPanelNav, isNavActive } from "@/lib/panel-nav";
import { panelFooterLabel, panelPathForRole } from "@/lib/role";

export function PanelSidebar({
  role,
  commentBadge = 0,
  onNavigate,
  onClose,
  touchFriendly = false,
  className,
}: {
  role: Role;
  commentBadge?: number;
  onNavigate?: () => void;
  onClose?: () => void;
  touchFriendly?: boolean;
  className?: string;
}) {
  const pathname = usePathname();
  const home = panelPathForRole(role);
  const homeLink = getPanelHome(role);
  const groups = getPanelNav(role);
  const homeActive = isNavActive(pathname, homeLink.href, home, true);

  const linkClass = touchFriendly
    ? "min-h-[44px] py-2.5 text-sm"
    : "py-2 text-[13px] leading-snug";
  const iconClass = touchFriendly ? "h-4 w-4" : "h-4 w-4";
  const sectionLabelClass = touchFriendly
    ? "mb-1 px-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-panel-text/55"
    : "mb-1 px-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-panel-text/55";

  return (
    <aside
      className={cn(
        "flex h-full w-full shrink-0 flex-col overflow-hidden bg-panel text-panel-text lg:w-[252px]",
        className,
      )}
    >
      {onClose ? (
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-panel-line/80 px-3 lg:hidden">
          <span className="text-sm font-bold text-white">Menü</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Menüyü kapat"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-panel-text active:bg-panel-alt active:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : null}

      <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-3">
        <div className="mb-2 border-b border-panel-line/80 pb-2">
          <Link
            href={homeLink.href}
            onClick={onNavigate}
            aria-current={homeActive ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-2.5 rounded-lg px-2.5 transition-colors",
              linkClass,
              homeActive
                ? "bg-brand font-semibold text-white"
                : "font-medium text-white/85 hover:bg-panel-alt hover:text-white",
            )}
          >
            {homeActive ? (
              <span
                className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-white/80"
                aria-hidden
              />
            ) : null}
            <homeLink.Icon
              className={cn(
                iconClass,
                "shrink-0",
                homeActive ? "text-white" : "text-white/70 group-hover:text-white",
              )}
            />
            <span className="min-w-0 flex-1 truncate">{homeLink.label}</span>
          </Link>
        </div>

        {groups.map((group) => (
          <NavSection
            key={group.id}
            label={group.label}
            home={home}
            pathname={pathname}
            items={group.items}
            commentBadge={commentBadge}
            onNavigate={onNavigate}
            linkClass={linkClass}
            iconClass={iconClass}
            sectionLabelClass={sectionLabelClass}
          />
        ))}
      </nav>

      <div
        className="shrink-0 border-t border-panel-line/80 p-2"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2 rounded-md px-2 font-medium text-panel-text transition-colors hover:bg-panel-alt hover:text-white lg:hidden",
            touchFriendly ? "min-h-[44px] text-sm" : "py-2 text-[13px]",
          )}
        >
          <ExternalLink className={iconClass} />
          Siteyi aç
        </Link>
        <p className="hidden px-2.5 py-1 text-[10px] font-medium tracking-wide text-panel-text/50 lg:block">
          {panelFooterLabel(role)}
        </p>
      </div>
    </aside>
  );
}

function NavSection({
  label,
  items,
  pathname,
  home,
  commentBadge,
  onNavigate,
  linkClass,
  iconClass,
  sectionLabelClass,
}: {
  label: string;
  items: ReturnType<typeof getPanelNav>[number]["items"];
  pathname: string;
  home: string;
  commentBadge: number;
  onNavigate?: () => void;
  linkClass: string;
  iconClass: string;
  sectionLabelClass: string;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <p className={sectionLabelClass}>{label}</p>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = isNavActive(pathname, item.href, home, item.exact);
          const badge = item.href.endsWith("/yorumlar") ? commentBadge : 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-lg px-2.5 transition-colors",
                  linkClass,
                  active
                    ? "bg-brand font-semibold text-white"
                    : "font-medium text-white/85 hover:bg-panel-alt hover:text-white",
                )}
              >
                {active ? (
                  <span
                    className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-white/80"
                    aria-hidden
                  />
                ) : null}
                <item.Icon
                  className={cn(
                    iconClass,
                    "shrink-0",
                    active ? "text-white" : "text-white/65 group-hover:text-white",
                  )}
                />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {badge > 0 ? (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold leading-none",
                      active ? "bg-white text-brand" : "bg-brand text-white",
                    )}
                  >
                    {badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
