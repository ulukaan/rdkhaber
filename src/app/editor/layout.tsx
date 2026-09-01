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
  await enforceStaff2FA(session.user.id, session.user.role);

  return (
    <PanelShell role="EDITOR" user={session.user}>
      {children}
    </PanelShell>
  );
}
