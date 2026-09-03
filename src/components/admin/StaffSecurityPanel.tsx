import type { Role } from "@prisma/client";
import { PageHeader } from "@/components/admin/PageHeader";
import { TwoFactorForm } from "@/components/admin/TwoFactorForm";

export function StaffSecurityPanel({
  initialEnabled,
  role: _role,
}: {
  initialEnabled: boolean;
  role: Role;
}) {
  return (
    <>
      <PageHeader
        title="Güvenlik"
        description="İki adımlı doğrulama isteğe bağlıdır. İsteyen açabilir, istediği zaman kapatabilir."
      />
      <TwoFactorForm initialEnabled={initialEnabled} />
    </>
  );
}
