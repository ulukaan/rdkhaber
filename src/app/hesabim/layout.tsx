import { requireRole } from "@/lib/auth-guard";
import { PanelShell } from "@/components/admin/PanelShell";
import { panelPathForRole } from "@/lib/role";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole(["USER", "ADMIN", "EDITOR"]);
  if (session.user.role !== "USER") {
    redirect(panelPathForRole(session.user.role));
  }

  return (
    <PanelShell role="USER" user={session.user}>
      {children}
    </PanelShell>
  );
}
