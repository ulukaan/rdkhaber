import Link from "next/link";
import { Mail, Send, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getMailConfig } from "@/lib/mail";
import { PageHeader } from "@/components/admin/PageHeader";
import { NewsletterNav } from "@/components/admin/NewsletterNav";
import { StatCard } from "@/components/admin/StatCard";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import {
  PanelDesktopOnly,
  PanelMobileCard,
  PanelMobileCardBody,
  PanelMobileEmpty,
  PanelMobileList,
  PanelMobileOnly,
} from "@/components/admin/PanelMobileList";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteNewsletterCampaignAction } from "@/actions/newsletter";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Bülten" };

const STATUS: Record<string, { text: string; variant: "brand" | "outline" | "dark" }> = {
  DRAFT: { text: "Taslak", variant: "outline" },
  SENDING: { text: "Gönderiliyor", variant: "dark" },
  SENT: { text: "Gönderildi", variant: "brand" },
};

export default async function NewsletterPage() {
  const [active, unsubscribed, campaigns, mail] = await Promise.all([
    prisma.newsletterSubscriber.count({ where: { status: "ACTIVE" } }),
    prisma.newsletterSubscriber.count({ where: { status: "UNSUBSCRIBED" } }),
    prisma.newsletterCampaign.findMany({ orderBy: { createdAt: "desc" }, take: 40 }),
    getMailConfig(),
  ]);

  return (
    <>
      <PageHeader
        title="Bülten"
        description="Kendi abone listenizi tutun, bülten yazın ve gönderin."
        action={
          <Button href="/admin/bulten/yeni" size="sm">
            Yeni bülten
          </Button>
        }
      />
      <NewsletterNav pathname="/admin/bulten" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Aktif abone" value={active} Icon={Users} href="/admin/bulten/aboneler" />
        <StatCard label="Bülten" value={campaigns.length} Icon={Mail} href="/admin/bulten/yeni" />
        <StatCard
          label="Ayrılan"
          value={unsubscribed}
          Icon={Send}
          href="/admin/bulten/aboneler"
        />
      </div>

      {!mail.configured ? (
        <p className="mt-6 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink-soft">
          Gönderim için SMTP gerekli.{" "}
          <Link href="/admin/bulten/ayarlar" className="font-semibold text-brand hover:underline">
            Ayarları açın
          </Link>
          . Hostinger: smtp.hostinger.com, port 587.
        </p>
      ) : null}

      <div className="mt-8">
        <PanelMobileOnly>
          {campaigns.length === 0 ? (
            <PanelMobileEmpty>Henüz bülten yok. Yeni bülten yazın veya haberlerden doldurun.</PanelMobileEmpty>
          ) : (
            <PanelMobileList>
              {campaigns.map((c) => {
                const badge = STATUS[c.status] ?? STATUS.DRAFT;
                return (
                  <PanelMobileCard key={c.id}>
                    <PanelMobileCardBody
                      footer={
                        <div className="panel-row-actions flex items-center justify-between gap-2">
                          <Link
                            href={`/admin/bulten/${c.id}`}
                            className="text-sm font-semibold text-brand hover:underline"
                          >
                            Aç
                          </Link>
                          {c.status !== "SENT" ? (
                            <DeleteButton id={c.id} action={deleteNewsletterCampaignAction} />
                          ) : null}
                        </div>
                      }
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant={badge.variant}>{badge.text}</Badge>
                      </div>
                      <Link href={`/admin/bulten/${c.id}`} className="text-sm font-bold text-ink hover:text-brand">
                        {c.subject}
                      </Link>
                      <p className="mt-2 text-xs text-ink-soft">
                        {c.sentAt
                          ? `${formatDate(c.sentAt)} · ${c.sentCount} kişi`
                          : formatDate(c.createdAt)}
                      </p>
                    </PanelMobileCardBody>
                  </PanelMobileCard>
                );
              })}
            </PanelMobileList>
          )}
        </PanelMobileOnly>

        <PanelDesktopOnly>
        <Table>
          <thead>
            <tr>
              <Th>Konu</Th>
              <Th>Durum</Th>
              <Th>Gönderim</Th>
              <Th className="text-right">İşlem</Th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <EmptyRow colSpan={4}>Henüz bülten yok. Yeni bülten yazın veya haberlerden doldurun.</EmptyRow>
            ) : (
              campaigns.map((c) => {
                const badge = STATUS[c.status] ?? STATUS.DRAFT;
                return (
                  <tr key={c.id}>
                    <Td className="font-semibold text-ink">
                      <Link href={`/admin/bulten/${c.id}`} className="hover:text-brand">
                        {c.subject}
                      </Link>
                    </Td>
                    <Td>
                      <Badge variant={badge.variant}>{badge.text}</Badge>
                    </Td>
                    <Td className="text-xs text-ink-soft">
                      {c.sentAt
                        ? `${formatDate(c.sentAt)} · ${c.sentCount} kişi`
                        : formatDate(c.createdAt)}
                    </Td>
                    <Td>
                      <div className="flex justify-end gap-3">
                        <Link href={`/admin/bulten/${c.id}`} className="text-sm font-semibold text-ink-soft hover:text-brand">
                          Aç
                        </Link>
                        {c.status !== "SENT" ? (
                          <DeleteButton id={c.id} action={deleteNewsletterCampaignAction} />
                        ) : null}
                      </div>
                    </Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
        </PanelDesktopOnly>
      </div>
    </>
  );
}
