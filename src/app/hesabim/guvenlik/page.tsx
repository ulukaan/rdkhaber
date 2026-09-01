import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { TwoFactorForm } from "@/components/admin/TwoFactorForm";
import { isStaffRole } from "@/lib/staff-security";

export const metadata = { title: "Güvenlik" };

export default async function AccountSecurityPage() {
  const session = await requireRole(["ADMIN", "EDITOR"]);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { totpEnabled: true },
  });

  const staff = isStaffRole(session.user.role);

  return (
    <>
      <h1 className="mb-1 text-xl font-extrabold text-ink">Güvenlik</h1>
      <p className="mb-6 text-sm text-ink-soft">
        {staff
          ? "Yönetim ve editör paneline erişim için iki adımlı doğrulama zorunludur."
          : "Hesap güvenliği ayarları."}
      </p>
      {staff && !user?.totpEnabled ? (
        <div className="mb-4 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-ink">
          Devam etmeden önce 2FA kurulumunu tamamlayın.
        </div>
      ) : null}
      <TwoFactorForm initialEnabled={Boolean(user?.totpEnabled)} />
    </>
  );
}
