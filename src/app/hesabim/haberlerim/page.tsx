import Link from "next/link";
import { requireRole } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { parseAttachmentUrls } from "@/lib/attachments";

export const metadata = { title: "Haberlerim" };

const statusLabel = {
  PENDING: { text: "İnceleniyor", variant: "outline" as const },
  APPROVED: { text: "Onaylandı", variant: "brand" as const },
  REJECTED: { text: "Reddedildi", variant: "dark" as const },
};

export default async function MemberSubmissionsPage() {
  const session = await requireRole(["USER"]);
  const rows = await prisma.newsSubmission.findMany({
    where: { submitterId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Haberlerim"
        description="Okuyucu masasına ilettiğiniz haber önerileri."
        action={<Button href="/hesabim/haber-gonder">Yeni haber gönder</Button>}
      />

      <Table>
        <thead>
          <tr>
            <Th>Başlık</Th>
            <Th>Durum</Th>
            <Th>Ek</Th>
            <Th>Tarih</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={4}>
              Henüz gönderiniz yok.{" "}
              <Link href="/hesabim/haber-gonder" className="font-semibold text-brand hover:underline">
                Haber gönderin
              </Link>
            </EmptyRow>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <Td>
                  <p className="font-semibold text-ink">{row.title}</p>
                  <p className="mt-0.5 line-clamp-2 max-w-xl text-xs text-ink-soft">
                    {row.content.replace(/<[^>]+>/g, " ").slice(0, 160)}
                  </p>
                </Td>
                <Td>
                  <Badge variant={statusLabel[row.status].variant}>
                    {statusLabel[row.status].text}
                  </Badge>
                </Td>
                <Td className="text-ink-soft">
                  {parseAttachmentUrls(row.attachmentUrl).length || "—"}
                </Td>
                <Td className="whitespace-nowrap text-ink-soft">{formatDate(row.createdAt)}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}
