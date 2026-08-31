import { requireRole } from "@/lib/auth-guard";
import { PanelShell } from "@/components/admin/PanelShell";

export const dynamic = "force-dynamic";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["ADMIN", "EDITOR"]);

  return (
    <PanelShell role="EDITOR" user={session.user}>
      {children}
    </PanelShell>
  );
}
