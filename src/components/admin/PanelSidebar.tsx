"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ExternalLink, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import type { Role } from "@prisma/client";
import { cn } from "@/lib/utils";
import { getPanelHome, getPanelNav, isNavActive } from "@/lib/panel-nav";
import { panelFooterLabel, panelPathForRole } from "@/lib/role";

export function PanelSidebar({
  role,
  commentBadge = 0,
  collapsed = false,
  onToggleCollapsed,
  onNavigate,
  onClose,
  touchFriendly = false,
  className,
}: {
  role: Role;
  commentBadge?: number;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
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
    : collapsed
      ? "justify-center px-0 py-2.5"
      : "py-2 text-[13px] leading-snug";
  const iconClass = touchFriendly ? "h-4 w-4" : "h-4 w-4";
  const sectionLabelClass = touchFriendly
    ? "text-[15px] font-extrabold uppercase tracking-[0.1em] text-white"
    : collapsed
      ? "sr-only"
      : "text-[15px] font-extrabold uppercase tracking-[0.1em] text-white";

  return (
    <aside
      className={cn(
        "flex h-full w-full shrink-0 flex-col overflow-hidden bg-panel text-panel-text transition-[width] duration-200",
        collapsed ? "lg:w-[72px]" : "lg:w-[260px]",
        className,
      )}
    >
      {onClose ? (
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-panel-line/80 px-3 lg:hidden">
          <span className="text-base font-bold text-white">Menü</span>
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

      <nav
        className={cn(
          "flex-1 overflow-y-auto overscroll-contain py-3",
          collapsed ? "px-1.5" : "px-2",
        )}
      >
        <div className={cn("mb-2 border-b border-panel-line/80 pb-2", collapsed && "px-0")}>
          <Link
            href={homeLink.href}
            onClick={onNavigate}
            aria-current={homeActive ? "page" : undefined}
            title={collapsed ? homeLink.label : undefined}
            className={cn(
              "group relative flex items-center gap-2.5 rounded-lg transition-colors",
              collapsed ? "justify-center px-0" : "px-2.5",
              linkClass,
              homeActive
                ? "bg-brand font-semibold text-white"
                : "font-medium text-white/85 hover:bg-panel-alt hover:text-white",
            )}
          >
            {homeActive && !collapsed ? (
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
            {!collapsed ? <span className="min-w-0 flex-1 truncate">{homeLink.label}</span> : null}
          </Link>
        </div>

        {groups.map((group) => (
          <NavSection
            key={group.id}
            id={group.id}
            label={group.label}
            home={home}
            pathname={pathname}
            items={group.items}
            commentBadge={commentBadge}
            onNavigate={onNavigate}
            linkClass={linkClass}
            iconClass={iconClass}
            sectionLabelClass={sectionLabelClass}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div
        className="shrink-0 border-t border-panel-line/80 p-2"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))" }}
      >
        {onToggleCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            title={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
            aria-label={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
            className={cn(
              "mb-1 hidden w-full items-center gap-2 rounded-lg font-semibold text-panel-text transition-colors hover:bg-panel-alt hover:text-white lg:flex",
              collapsed ? "justify-center px-0 py-2.5" : "px-2.5 py-2 text-[13px]",
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4 shrink-0" />
                <span>Menüyü daralt</span>
              </>
            )}
          </button>
        ) : null}

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          title={collapsed ? "Siteyi aç" : undefined}
          className={cn(
            "flex items-center gap-2 rounded-md font-medium text-panel-text transition-colors hover:bg-panel-alt hover:text-white lg:hidden",
            touchFriendly ? "min-h-[44px] text-sm" : "py-2 text-[13px]",
          )}
        >
          <ExternalLink className={iconClass} />
          Siteyi aç
        </Link>
        {!collapsed ? (
          <p className="hidden px-2.5 py-1 text-[10px] font-medium tracking-wide text-panel-text/50 lg:block">
            {panelFooterLabel(role)}
          </p>
        ) : null}
      </div>
    </aside>
  );
}

function NavSection({
  id,
  label,
  items,
  pathname,
  home,
  commentBadge,
  onNavigate,
  linkClass,
  iconClass,
  sectionLabelClass,
  collapsed,
}: {
  id: string;
  label: string;
  items: ReturnType<typeof getPanelNav>[number]["items"];
  pathname: string;
  home: string;
  commentBadge: number;
  onNavigate?: () => void;
  linkClass: string;
  iconClass: string;
  sectionLabelClass: string;
  collapsed: boolean;
}) {
  const hasActive = items.some((item) => isNavActive(pathname, item.href, home, item.exact));
  const [open, setOpen] = useState(false);
  const isOpen = open;

  function toggleOpen() {
    if (collapsed) return;
    setOpen((prev) => !prev);
  }

  const showItems = collapsed || isOpen;

  return (
    <div className={cn("mb-3 last:mb-0", collapsed && "mb-2")}>
      {collapsed ? (
        <div className="mx-auto mb-1.5 h-px w-8 bg-panel-line/80" aria-hidden />
      ) : (
        <div className="mb-2 border-y border-panel-line/70">
          <button
            type="button"
            onClick={toggleOpen}
            aria-expanded={isOpen}
            className={cn(
              "flex w-full items-center justify-between px-2.5 py-2.5 text-left transition-colors hover:bg-panel-alt/60",
              sectionLabelClass,
              hasActive && "text-white",
            )}
          >
            <span>{label}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-white/60 transition-transform duration-200",
                isOpen && "rotate-180",
              )}
              aria-hidden
            />
          </button>
        </div>
      )}

      {showItems ? (
        <ul className={cn("flex flex-col gap-0.5", collapsed && "items-center")}>
          {items.map((item) => {
            const active = isNavActive(pathname, item.href, home, item.exact);
            const badge = item.href.endsWith("/yorumlar") ? commentBadge : 0;
            return (
              <li key={item.href} className={cn(collapsed && "w-full")}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex items-center gap-2.5 rounded-lg transition-colors",
                    collapsed ? "justify-center px-0" : "px-2.5",
                    linkClass,
                    active
                      ? "bg-brand font-semibold text-white"
                      : "font-medium text-white/85 hover:bg-panel-alt hover:text-white",
                  )}
                >
                  {active && !collapsed ? (
                    <span
                      className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-white/80"
                      aria-hidden
                    />
                  ) : null}
                  <span className="relative shrink-0">
                    <item.Icon
                      className={cn(
                        iconClass,
                        active ? "text-white" : "text-white/65 group-hover:text-white",
                      )}
                    />
                    {collapsed && badge > 0 ? (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">
                        {badge > 9 ? "9+" : badge}
                      </span>
                    ) : null}
                  </span>
                  {!collapsed ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : null}
                  {!collapsed && badge > 0 ? (
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
      ) : null}
    </div>
  );
}
