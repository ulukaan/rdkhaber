import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import { Badge } from "@/components/ui/Badge";
import { TipRowActions } from "@/components/admin/TipRowActions";
import { AttachmentPreview } from "@/components/admin/AttachmentPreview";
import { formatDate } from "@/lib/utils";

const STATUS_LABEL: Record<string, { text: string; variant: "brand" | "outline" | "dark" }> = {
  PENDING: { text: "Bekliyor", variant: "outline" },
  APPROVED: { text: "İncelendi", variant: "brand" },
  REJECTED: { text: "Reddedildi", variant: "dark" },
};

export async function TipInboxPage() {
  const tips = await prisma.tip.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <PageHeader
        title="İhbar Hattı"
        description="Okuyucu ihbarları ve iletişim formu mesajları. İletişim kayıtları [İletişim] önekiyle gelir."
      />
      <Table>
        <thead>
          <tr>
            <Th>Mesaj</Th>
            <Th>İletişim</Th>
            <Th>Durum</Th>
            <Th>Tarih</Th>
            <Th className="text-right">İşlemler</Th>
          </tr>
        </thead>
        <tbody>
          {tips.length === 0 && <EmptyRow colSpan={5}>Henüz ihbar yok.</EmptyRow>}
          {tips.map((t) => {
            const isContact = t.message.startsWith("[İletişim]");
            return (
              <tr key={t.id} className="hover:bg-surface/60">
                <Td className="max-w-md">
                  {isContact ? (
                    <Badge variant="outline" className="mb-1">
                      İletişim
                    </Badge>
                  ) : null}
                  <span className="block whitespace-pre-wrap">{t.message}</span>
                  <AttachmentPreview raw={t.attachmentUrl} />
                </Td>
                <Td className="text-ink-soft">{t.contactInfo || "—"}</Td>
                <Td>
                  <Badge variant={STATUS_LABEL[t.status].variant}>
                    {STATUS_LABEL[t.status].text}
                  </Badge>
                </Td>
                <Td className="whitespace-nowrap text-xs text-ink-soft">
                  {formatDate(t.createdAt)}
                </Td>
                <Td>
                  <TipRowActions id={t.id} status={t.status} />
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}
