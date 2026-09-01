import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { StaffSecurityPanel } from "@/components/admin/StaffSecurityPanel";

export const metadata = { title: "Güvenlik (2FA)" };

export default async function AdminSecurityPage() {
  const session = await requireRole(["ADMIN"]);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpEnabled: true },
  });

  return (
    <StaffSecurityPanel
      initialEnabled={Boolean(user?.totpEnabled)}
      role={session.user.role}
    />
  );
}
