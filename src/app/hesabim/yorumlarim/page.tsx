import Link from "next/link";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Yorumlarım" };

export default async function MemberCommentsPage() {
  const session = await requireAuth();
  const rows = await prisma.comment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { article: { select: { title: true, slug: true } } },
  });

  return (
    <>
      <PageHeader
        title="Yorumlarım"
        description="Haberlerin altına yazdığınız yorumlar. Onaylananlar sitede görünür."
      />

      <Table>
        <thead>
          <tr>
            <Th>Yorum</Th>
            <Th>Haber</Th>
            <Th>Durum</Th>
            <Th>Tarih</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <EmptyRow colSpan={4}>Henüz yorumunuz yok.</EmptyRow>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <Td>
                  <p className="max-w-xl text-sm text-ink">{row.content}</p>
                </Td>
                <Td>
                  <Link
                    href={`/haber/${row.article.slug}`}
                    className="font-semibold text-ink hover:text-brand"
                  >
                    {row.article.title}
                  </Link>
                </Td>
                <Td>
                  <Badge variant={row.approved ? "brand" : "outline"}>
                    {row.approved ? "Yayında" : "Onay bekliyor"}
                  </Badge>
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
