import type { Role } from "@prisma/client";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { PanelChrome } from "@/components/admin/PanelChrome";

export async function PanelShell({
  role,
  user,
  children,
}: {
  role: Role;
  user: NonNullable<Session["user"]>;
  children: React.ReactNode;
}) {
  const [commentBadge, settings] = await Promise.all([
    prisma.comment.count({ where: { approved: false } }),
    getSettings(),
  ]);

  return (
    <PanelChrome
      role={role}
      user={user}
      siteName={settings.siteName}
      logoUrl={settings.logoUrl || undefined}
      commentBadge={commentBadge}
    >
      {children}
    </PanelChrome>
  );
}
