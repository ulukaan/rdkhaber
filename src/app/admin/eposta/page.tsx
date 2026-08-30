import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { MailboxNav } from "@/components/admin/MailboxNav";
import { MailboxSyncButton } from "@/components/admin/MailboxSyncButton";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getImapConfig } from "@/lib/imap-config";
import { getMailConfig } from "@/lib/mail";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Gelen e-posta" };

export default async function MailboxInboxPage() {
  const [messages, mail, imap] = await Promise.all([
    prisma.mailboxMessage.findMany({
      where: { direction: "INBOUND" },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    getMailConfig(),
    getImapConfig(),
  ]);

  return (
    <>
      <PageHeader
        title="E-posta"
        description="Gelen kutusu ve panelden gönderilen iletiler."
        action={
          <div className="flex flex-wrap gap-2">
            <MailboxSyncButton />
            <Button href="/admin/eposta/yeni" size="sm">
              Yeni e-posta
            </Button>
          </div>
        }
      />
      <MailboxNav pathname="/admin/eposta" />

      {!mail.configured ? (
        <p className="mb-4 rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-ink-soft">
          SMTP ayarlı değil. Gönderim için{" "}
          <Link href="/admin/bulten/ayarlar" className="font-semibold text-brand hover:underline">
            Bülten &gt; Ayarlar
          </Link>{" "}
          bölümünü doldurun.
        </p>
      ) : null}

      {imap.configured ? (
        <p className="mb-4 text-sm text-ink-soft">
          <strong className="text-ink">Gelen kutusunu al</strong> ile Hostinger IMAP’ten son e-postalar çekilir (
          {imap.user}).
        </p>
      ) : (
        <p className="mb-4 text-sm text-ink-soft">
          IMAP için Bülten SMTP bilgileri kullanılır; gerekirse sunucuda IMAP_USER / IMAP_PASS tanımlayın.
        </p>
      )}

      <Table>
        <thead>
          <tr>
            <Th>Gönderen</Th>
            <Th>Konu</Th>
            <Th>Tarih</Th>
            <Th className="text-right">Durum</Th>
          </tr>
        </thead>
        <tbody>
          {messages.length === 0 ? (
            <EmptyRow colSpan={4}>
              Gelen e-posta yok. &quot;Gelen kutusunu al&quot; ile senkronize edin.
            </EmptyRow>
          ) : (
            messages.map((m) => (
              <tr key={m.id} className={!m.isRead ? "bg-brand/[0.03]" : undefined}>
                <Td>
                  <Link href={`/admin/eposta/${m.id}`} className="block font-semibold text-ink hover:text-brand">
                    {m.fromAddress}
                  </Link>
                </Td>
                <Td>
                  <Link href={`/admin/eposta/${m.id}`} className="line-clamp-1 text-ink-soft hover:text-brand">
                    {m.subject}
                  </Link>
                </Td>
                <Td className="whitespace-nowrap text-xs text-ink-soft">{formatDate(m.createdAt)}</Td>
                <Td className="text-right">
                  {!m.isRead ? <Badge variant="brand">Yeni</Badge> : <span className="text-xs text-ink-soft">Okundu</span>}
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}
