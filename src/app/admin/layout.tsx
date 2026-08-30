import { requireRole } from "@/lib/auth-guard";
import { PanelShell } from "@/components/admin/PanelShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["ADMIN"]);

  return (
    <PanelShell role="ADMIN" user={session.user}>
      {children}
    </PanelShell>
  );
}
