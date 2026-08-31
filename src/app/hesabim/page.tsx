import Link from "next/link";
import { Mail, MessageSquare, Newspaper, Send, UserRound } from "lucide-react";
import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Badge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Hesabım" };

const statusLabel = {
  PENDING: { text: "İnceleniyor", variant: "outline" as const },
  APPROVED: { text: "Onaylandı", variant: "brand" as const },
  REJECTED: { text: "Reddedildi", variant: "dark" as const },
};

export default async function MemberDashboardPage() {
  const session = await requireRole(["USER"]);
  const email = session.user.email ?? "";

  const [submissions, comments, newsletter, recent] = await Promise.all([
    prisma.newsSubmission.count({ where: { submitterId: session.user.id } }),
    prisma.comment.count({ where: { userId: session.user.id } }),
    email
      ? prisma.newsletterSubscriber.findUnique({
          where: { email },
          select: { status: true },
        })
      : Promise.resolve(null),
    prisma.newsSubmission.findMany({
      where: { submitterId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, createdAt: true },
    }),
  ]);

  const subscribed = newsletter?.status === "ACTIVE";

  return (
    <>
      <PageHeader
        title={`Merhaba, ${session.user.name?.split(" ")[0] ?? "üyemiz"}`}
        description="Gönderilerinizi, yorumlarınızı ve profilinizi buradan yönetin."
        action={
          <Button href="/hesabim/haber-gonder">
            <Send className="h-4 w-4" />
            Haber gönder
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Haberlerim" value={submissions} Icon={Newspaper} href="/hesabim/haberlerim" />
        <StatCard label="Yorumlarım" value={comments} Icon={MessageSquare} href="/hesabim/yorumlarim" />
        <StatCard
          label="Bülten"
          value={subscribed ? "Açık" : "Kapalı"}
          Icon={Mail}
          href="/hesabim/bulten"
          highlight={subscribed}
        />
        <StatCard label="Profil" value="Düzenle" Icon={UserRound} href="/hesabim/profil" />
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
            <span className="h-4 w-1 rounded-full bg-brand" aria-hidden />
            Son gönderiler
          </h3>
          <Link
            href="/hesabim/haberlerim"
            className="text-xs font-semibold text-ink-soft transition-colors hover:text-brand"
          >
            Tümünü gör →
          </Link>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink-soft">
              Henüz haber göndermediniz.{" "}
              <Link href="/hesabim/haber-gonder" className="font-semibold text-brand hover:underline">
                İlk haberinizi iletin
              </Link>
            </p>
          ) : (
            recent.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                <span className="min-w-0 truncate font-semibold text-ink">{item.title}</span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="hidden text-xs text-ink-soft sm:inline">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                  <Badge variant={statusLabel[item.status].variant}>
                    {statusLabel[item.status].text}
                  </Badge>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
