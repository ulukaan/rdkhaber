import { headers } from "next/headers";
import { requireRole } from "@/lib/auth-guard";
import { PanelShell } from "@/components/admin/PanelShell";
import { enforceStaff2FA } from "@/lib/staff-security";

export const dynamic = "force-dynamic";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const pathname = (await headers()).get("x-pathname") ?? "";
  await enforceStaff2FA(session.user.id, session.user.role, pathname);

  return (
    <PanelShell role="EDITOR" user={session.user}>
      {children}
    </PanelShell>
  );
}
