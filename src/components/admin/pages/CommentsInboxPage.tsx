import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import { Badge } from "@/components/ui/Badge";
import { CommentRowActions } from "@/components/admin/CommentRowActions";
import { formatDate } from "@/lib/utils";

export async function CommentsInboxPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: { article: { select: { title: true, slug: true } } },
    take: 100,
  });

  return (
    <>
      <PageHeader
        title="Yorumlar"
        description="Onaysız yorumlar yayına çıkmaz. Saldırı/spam kayıtlarını silin."
      />
      <Table>
        <thead>
          <tr>
            <Th>Yorum</Th>
            <Th>Yazar</Th>
            <Th>Haber</Th>
            <Th>Durum</Th>
            <Th>Tarih</Th>
            <Th className="text-right">İşlemler</Th>
          </tr>
        </thead>
        <tbody>
          {comments.length === 0 && <EmptyRow colSpan={6}>Yorum yok.</EmptyRow>}
          {comments.map((c) => (
            <tr key={c.id} className="hover:bg-surface/60">
              <Td className="max-w-sm break-all text-ink">{c.content}</Td>
              <Td>{c.authorName}</Td>
              <Td className="max-w-[12rem] truncate">{c.article.title}</Td>
              <Td>
                <Badge variant={c.approved ? "brand" : "outline"}>
                  {c.approved ? "Yayında" : "Pasif"}
                </Badge>
              </Td>
              <Td className="whitespace-nowrap text-xs text-ink-soft">{formatDate(c.createdAt)}</Td>
              <Td>
                <CommentRowActions id={c.id} approved={c.approved} />
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
