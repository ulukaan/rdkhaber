import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { TwoFactorForm } from "@/components/admin/TwoFactorForm";

export const metadata = { title: "Güvenlik" };

export default async function AccountSecurityPage() {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpEnabled: true },
  });

  return (
    <>
      <h1 className="mb-1 text-xl font-extrabold text-ink">Güvenlik</h1>
      <p className="mb-6 text-sm text-ink-soft">
        İki adımlı doğrulama isteğe bağlıdır. İsteyen açabilir, istediği zaman kapatabilir.
      </p>
      <TwoFactorForm initialEnabled={Boolean(user?.totpEnabled)} />
    </>
  );
}
