import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { MemberProfileForm } from "@/components/member/MemberProfileForm";

export const metadata = { title: "Profil" };

export default async function MemberProfilePage() {
  const session = await requireRole(["USER"]);
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, bio: true, avatarUrl: true },
  });

  return (
    <>
      <PageHeader
        title="Profil"
        description="Hesap bilgilerinizi ve profil fotoğrafınızı güncelleyin."
      />
      <MemberProfileForm
        defaults={{
          name: user?.name ?? session.user.name ?? "",
          email: user?.email ?? session.user.email ?? "",
          bio: user?.bio ?? null,
          avatarUrl: user?.avatarUrl ?? null,
        }}
      />
    </>
  );
}
