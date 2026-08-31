import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { PageHeader } from "@/components/admin/PageHeader";
import { TwoFactorForm } from "@/components/admin/TwoFactorForm";

export const metadata = { title: "Güvenlik" };

export default async function SecurityPage() {
  const session = await requireRole(["ADMIN"]);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpEnabled: true },
  });

  return (
    <>
      <PageHeader
        title="Güvenlik"
        description="Yönetici hesabı için iki adımlı doğrulama ve oturum güvenliği."
      />
      <TwoFactorForm initialEnabled={Boolean(user?.totpEnabled)} />
    </>
  );
}
