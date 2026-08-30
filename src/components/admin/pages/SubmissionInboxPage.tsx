import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import { Badge } from "@/components/ui/Badge";
import { SubmissionRowActions } from "@/components/admin/SubmissionRowActions";
import { AttachmentPreview } from "@/components/admin/AttachmentPreview";
import { formatDate } from "@/lib/utils";

const STATUS_LABEL: Record<string, { text: string; variant: "brand" | "outline" | "dark" }> = {
  PENDING: { text: "Bekliyor", variant: "outline" },
  APPROVED: { text: "Onaylandı", variant: "brand" },
  REJECTED: { text: "Reddedildi", variant: "dark" },
};

export async function SubmissionInboxPage({ basePath }: { basePath: string }) {
  const submissions = await prisma.newsSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader
        title="Okuyucu Haberleri"
        description="Okuyuculardan gelen haber önerileri. Onaylananlar taslak olarak haberler listesine eklenir."
      />
      <Table>
        <thead>
          <tr>
            <Th>Başlık / İçerik</Th>
            <Th>Gönderen</Th>
            <Th>Durum</Th>
            <Th>Tarih</Th>
            <Th className="text-right">İşlemler</Th>
          </tr>
        </thead>
        <tbody>
          {submissions.length === 0 && (
            <EmptyRow colSpan={5}>Henüz okuyucu haberi yok.</EmptyRow>
          )}
          {submissions.map((s) => (
            <tr key={s.id} className="hover:bg-surface/60">
              <Td className="max-w-lg">
                <p className="font-semibold text-ink">{s.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{s.content}</p>
                <AttachmentPreview raw={s.attachmentUrl} />
              </Td>
              <Td className="text-ink-soft">
                {s.submitterName || s.submitterEmail || "Anonim"}
              </Td>
              <Td>
                <Badge variant={STATUS_LABEL[s.status].variant}>
                  {STATUS_LABEL[s.status].text}
                </Badge>
              </Td>
              <Td className="whitespace-nowrap text-xs text-ink-soft">
                {formatDate(s.createdAt)}
              </Td>
              <Td>
                <SubmissionRowActions id={s.id} status={s.status} basePath={basePath} />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
