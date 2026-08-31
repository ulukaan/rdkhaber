import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { MemberNewsletterCard } from "@/components/member/MemberNewsletterCard";

export const metadata = { title: "E-posta bülteni" };

export default async function MemberNewsletterPage() {
  const session = await requireAuth();
  const email = session.user.email ?? "";
  const row = email
    ? await prisma.newsletterSubscriber.findUnique({
        where: { email },
        select: { status: true },
      })
    : null;

  return (
    <>
      <PageHeader
        title="E-posta bülteni"
        description="Hesap e-postanız üzerinden aboneliğinizi yönetin."
      />
      <div className="max-w-xl">
        <MemberNewsletterCard subscribed={row?.status === "ACTIVE"} />
      </div>
    </>
  );
}
