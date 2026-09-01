import type { Role } from "@prisma/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { TwoFactorForm } from "@/components/admin/TwoFactorForm";
import { panelPathForRole } from "@/lib/role";

export function StaffSecurityPanel({
  initialEnabled,
  role,
}: {
  initialEnabled: boolean;
  role: Role;
}) {
  return (
    <>
      <PageHeader
        title="Güvenlik"
        description="Yönetim ve editör paneline erişim için iki adımlı doğrulama zorunludur."
      />
      {!initialEnabled ? (
        <div className="mb-4 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-ink">
          Devam etmeden önce 2FA kurulumunu tamamlayın.
        </div>
      ) : null}
      <TwoFactorForm
        initialEnabled={initialEnabled}
        redirectAfterEnable={panelPathForRole(role)}
      />
    </>
  );
}
