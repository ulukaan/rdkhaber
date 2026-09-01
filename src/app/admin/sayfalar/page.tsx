import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import {
  PanelDesktopOnly,
  PanelMobileCard,
  PanelMobileCardBody,
  PanelMobileEmpty,
  PanelMobileList,
  PanelMobileOnly,
} from "@/components/admin/PanelMobileList";
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

      <PanelMobileOnly>
        {pages.length === 0 ? (
          <PanelMobileEmpty>Sayfa yok.</PanelMobileEmpty>
        ) : (
          <PanelMobileList>
            {pages.map((p) => (
              <PanelMobileCard key={p.id}>
                <PanelMobileCardBody
                  footer={
                    <div className="panel-row-actions flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/sayfalar/${p.id}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border text-ink-soft active:text-brand"
                        aria-label="Düzenle"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteButton id={p.id} action={deletePageAction} />
                    </div>
                  }
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant={p.published ? "brand" : "outline"}>
                      {p.published ? "Yayında" : "Taslak"}
                    </Badge>
                    <span className="text-[11px] text-ink-soft">{formatDate(p.updatedAt)}</span>
                  </div>
                  <p className="font-semibold text-ink">{p.title}</p>
                  <p className="mt-1 break-all text-xs text-ink-soft">/sayfa/{p.slug}</p>
                </PanelMobileCardBody>
              </PanelMobileCard>
            ))}
          </PanelMobileList>
        )}
      </PanelMobileOnly>

      <PanelDesktopOnly>
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
      </PanelDesktopOnly>
    </>
  );
}
