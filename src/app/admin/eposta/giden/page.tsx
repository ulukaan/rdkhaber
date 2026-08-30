import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { MailboxNav } from "@/components/admin/MailboxNav";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Giden e-posta" };

const SOURCE_LABELS: Record<string, string> = {
  compose: "Panel",
  newsletter: "Bülten",
  system: "Sistem",
  imap: "IMAP",
};

export default async function MailboxSentPage() {
  const messages = await prisma.mailboxMessage.findMany({
    where: { direction: "OUTBOUND" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <PageHeader
        title="Giden e-posta"
        description="Panelden ve sistemden gönderilen tüm iletiler."
        action={
          <Button href="/admin/eposta/yeni" size="sm">
            Yeni e-posta
          </Button>
        }
      />
      <MailboxNav pathname="/admin/eposta/giden" />

      <Table>
        <thead>
          <tr>
            <Th>Alıcı</Th>
            <Th>Konu</Th>
            <Th>Kaynak</Th>
            <Th>Tarih</Th>
          </tr>
        </thead>
        <tbody>
          {messages.length === 0 ? (
            <EmptyRow colSpan={4}>Henüz giden e-posta kaydı yok.</EmptyRow>
          ) : (
            messages.map((m) => (
              <tr key={m.id}>
                <Td>
                  <Link href={`/admin/eposta/${m.id}`} className="font-semibold text-ink hover:text-brand">
                    {m.toAddress}
                  </Link>
                </Td>
                <Td>
                  <Link href={`/admin/eposta/${m.id}`} className="line-clamp-1 text-ink-soft hover:text-brand">
                    {m.subject}
                  </Link>
                </Td>
                <Td>
                  <Badge variant="outline">{SOURCE_LABELS[m.source] ?? m.source}</Badge>
                </Td>
                <Td className="whitespace-nowrap text-xs text-ink-soft">{formatDate(m.createdAt)}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}
