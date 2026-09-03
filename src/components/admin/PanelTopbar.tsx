"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ExternalLink, LogOut, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { Role } from "@prisma/client";
import type { Session } from "next-auth";
import { panelBrandLabel, panelPathForRole, roleLabel } from "@/lib/role";
import { signOutAction } from "@/actions/auth";
import { getPanelBreadcrumb } from "@/lib/panel-nav";
import { PanelBrand } from "@/components/admin/PanelBrand";

export function PanelTopbar({
  user,
  role,
  siteName,
  logoUrl,
  onMenu,
  onSidebarToggle,
  sidebarCollapsed = false,
}: {
  user: NonNullable<Session["user"]>;
  role: Role;
  siteName: string;
  logoUrl?: string;
  onMenu: () => void;
  onSidebarToggle?: () => void;
  sidebarCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const crumb = getPanelBreadcrumb(pathname, role);
  const home = panelPathForRole(role);

  return (
    <header
      className="sticky top-0 z-40 shrink-0 border-b border-border bg-white"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="flex h-14 items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onMenu}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-ink active:bg-surface lg:hidden"
            aria-label="Menüyü aç"
          >
            <Menu className="h-5 w-5" />
          </button>

          {onSidebarToggle ? (
            <button
              type="button"
              onClick={onSidebarToggle}
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-ink transition-colors hover:border-brand hover:text-brand lg:flex"
              aria-label={sidebarCollapsed ? "Menüyü genişlet" : "Menüyü daralt"}
              title={sidebarCollapsed ? "Menüyü genişlet" : "Menüyü daralt"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>
          ) : null}

          <PanelBrand
            href={home}
            siteName={siteName}
            logoUrl={logoUrl}
            roleLabel={panelBrandLabel(role)}
            compact
          />

          <nav
            aria-label="Konum"
            className="ml-2 hidden min-w-0 items-center gap-1.5 border-l border-border pl-4 text-sm lg:flex"
          >
            <span className="truncate text-ink-soft">{crumb.group}</span>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-soft/70" />
            <span className="flex min-w-0 items-center gap-2 truncate font-semibold text-ink">
              <crumb.Icon className="h-3.5 w-3.5 shrink-0 text-brand" />
              {crumb.page}
            </span>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-ink-soft transition-colors hover:border-brand hover:text-brand sm:flex"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Siteyi aç
          </Link>

          <div className="flex items-center gap-2 border-l border-border pl-2 md:gap-2.5 md:pl-3">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name ? `${user.name} profil fotoğrafı` : "Profil fotoğrafı"}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-xs font-bold uppercase text-white">
                {initials(user.name)}
              </span>
            )}
            <div className="hidden text-left text-sm leading-tight md:block">
              <p className="font-semibold text-ink">{user.name}</p>
              <p className="text-xs text-ink-soft">{roleLabel(user.role)}</p>
            </div>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft active:bg-brand/10 active:text-brand"
              title="Çıkış Yap"
              aria-label="Çıkış Yap"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <nav
        aria-label="Konum"
        className="flex min-w-0 items-center gap-1.5 border-t border-border/80 px-3 py-2 text-xs lg:hidden"
      >
        <span className="truncate text-ink-soft">{crumb.group}</span>
        <ChevronRight className="h-3 w-3 shrink-0 text-ink-soft/70" />
        <span className="flex min-w-0 items-center gap-1.5 truncate font-semibold text-ink">
          <crumb.Icon className="h-3.5 w-3.5 shrink-0 text-brand" />
          {crumb.page}
        </span>
      </nav>
    </header>
  );
}

function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]).join("") || "?";
}
