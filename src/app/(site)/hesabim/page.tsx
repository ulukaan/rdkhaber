import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { panelPathForRole } from "@/lib/role";

export const metadata = { title: "Hesabım" };

const statusLabel = {
  PENDING: { text: "İnceleniyor", variant: "outline" as const },
  APPROVED: { text: "Onaylandı", variant: "brand" as const },
  REJECTED: { text: "Reddedildi", variant: "dark" as const },
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris");
  if (session.user.role !== "USER") redirect(panelPathForRole(session.user.role));

  const submissions = await prisma.newsSubmission.findMany({
    where: { submitterId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container className="py-6">
      <div className="mb-6 rounded-lg border border-border p-5">
        <h1 className="text-xl font-extrabold text-ink">{session.user.name}</h1>
        <p className="text-sm text-ink-soft">{session.user.email}</p>
      </div>

      <SectionHeading title="Gönderdiğim Haberler" />
      {submissions.length === 0 ? (
        <p className="text-ink-soft">Henüz haber göndermediniz.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {submissions.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="font-semibold text-ink">{s.title}</p>
                <p className="text-xs text-ink-soft">{formatDate(s.createdAt)}</p>
              </div>
              <Badge variant={statusLabel[s.status].variant}>
                {statusLabel[s.status].text}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
