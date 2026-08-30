"use client";

import { useEffect, useState } from "react";
import type { Role } from "@prisma/client";
import type { Session } from "next-auth";
import { PanelSidebar } from "@/components/admin/PanelSidebar";
import { PanelTopbar } from "@/components/admin/PanelTopbar";

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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-panel-bg">
      <PanelTopbar
        user={user}
        role={role}
        siteName={siteName}
        logoUrl={logoUrl}
        onMenu={() => setOpen(true)}
      />

      <div className="flex min-h-0 flex-1">
        <PanelSidebar
          role={role}
          commentBadge={commentBadge}
          className="hidden h-full lg:flex"
        />

        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
            <button
              type="button"
              aria-label="Menüyü kapat"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-ink/55"
            />
            <div
              className="relative flex h-full w-[min(100%,288px)] max-w-[85vw] flex-col shadow-2xl"
              style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
            >
              <PanelSidebar
                role={role}
                commentBadge={commentBadge}
                onNavigate={() => setOpen(false)}
                onClose={() => setOpen(false)}
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
