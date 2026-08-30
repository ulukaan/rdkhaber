import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deletePageAction } from "@/actions/page";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Sayfalar" };

export default async function PagesAdminPage() {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <>
      <PageHeader
        title="Sayfalar"
        description="Künye, gizlilik ve kurumsal metinler."
        action={
          <Button href="/admin/sayfalar/yeni" size="sm">
            <Plus className="h-4 w-4" /> Yeni Sayfa
          </Button>
        }
      />
      <Table>
        <thead>
          <tr>
            <Th>Başlık</Th>
            <Th>Slug</Th>
            <Th>Durum</Th>
            <Th>Güncelleme</Th>
            <Th className="text-right">İşlemler</Th>
          </tr>
        </thead>
        <tbody>
          {pages.length === 0 && <EmptyRow colSpan={5}>Sayfa yok.</EmptyRow>}
          {pages.map((p) => (
            <tr key={p.id}>
              <Td className="font-semibold text-ink">{p.title}</Td>
              <Td className="text-ink-soft">{p.slug}</Td>
              <Td>
                <Badge variant={p.published ? "brand" : "outline"}>
                  {p.published ? "Yayında" : "Taslak"}
                </Badge>
              </Td>
              <Td className="text-xs text-ink-soft">{formatDate(p.updatedAt)}</Td>
              <Td>
                <div className="flex items-center justify-end gap-3">
                  <Link href={`/admin/sayfalar/${p.id}`} className="text-ink-soft hover:text-brand">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <DeleteButton id={p.id} action={deletePageAction} />
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
