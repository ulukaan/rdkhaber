"use client";

import { useEffect, useState } from "react";
import type { Role } from "@prisma/client";
import type { Session } from "next-auth";
import { PanelSidebar } from "@/components/admin/PanelSidebar";
import { PanelTopbar } from "@/components/admin/PanelTopbar";

const SIDEBAR_STORAGE_KEY = "rdk-panel-sidebar";

export function PanelChrome({
  role,
  user,
  siteName,
  logoUrl,
  commentBadge,
  children,
}: {
  role: Role;
  user: NonNullable<Session["user"]>;
  siteName: string;
  logoUrl?: string;
  commentBadge: number;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "collapsed");
    } catch {
      // localStorage yoksa varsayılan geniş
    }
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "collapsed" : "expanded");
      } catch {
        // geç
      }
      return next;
    });
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-panel-bg">
      <PanelTopbar
        user={user}
        role={role}
        siteName={siteName}
        logoUrl={logoUrl}
        onMenu={() => setMobileOpen(true)}
        onSidebarToggle={toggleCollapsed}
        sidebarCollapsed={collapsed}
      />

      <div className="flex min-h-0 flex-1">
        <PanelSidebar
          role={role}
          commentBadge={commentBadge}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          className="hidden h-full lg:flex"
        />

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
            <button
              type="button"
              aria-label="Menüyü kapat"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-ink/55"
            />
            <div
              className="relative flex h-full w-[min(100%,300px)] max-w-[88vw] flex-col shadow-2xl"
              style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
            >
              <PanelSidebar
                role={role}
                commentBadge={commentBadge}
                onNavigate={() => setMobileOpen(false)}
                onClose={() => setMobileOpen(false)}
                touchFriendly
              />
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
          <div className="mx-auto w-full max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
