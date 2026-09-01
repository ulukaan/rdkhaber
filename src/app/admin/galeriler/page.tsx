import { Plus } from "lucide-react";
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
import { deleteGalleryAction } from "@/actions/gallery";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Foto Galeri" };

export default async function GalleriesPage() {
  const galleries = await prisma.gallery.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { images: true } } },
  });

  return (
    <>
      <PageHeader
        title="Foto Galeri"
        description="Çok görselli haber paketleri."
        action={
          <Button href="/admin/galeriler/yeni" size="sm">
            <Plus className="h-4 w-4" /> Yeni Galeri
          </Button>
        }
      />

      <PanelMobileOnly>
        {galleries.length === 0 ? (
          <PanelMobileEmpty>Galeri yok.</PanelMobileEmpty>
        ) : (
          <PanelMobileList>
            {galleries.map((g) => (
              <PanelMobileCard key={g.id}>
                <PanelMobileCardBody
                  footer={
                    <div className="panel-row-actions flex justify-end">
                      <DeleteButton id={g.id} action={deleteGalleryAction} />
                    </div>
                  }
                >
                  <p className="font-semibold text-ink">{g.title}</p>
                  <p className="mt-1 break-all text-xs text-ink-soft">/{g.slug}</p>
                  <p className="mt-2 text-xs text-ink-soft">
                    {g._count.images} görsel · {formatDate(g.createdAt)}
                  </p>
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
              <Th>Görsel</Th>
              <Th>Tarih</Th>
              <Th className="text-right">İşlemler</Th>
            </tr>
          </thead>
          <tbody>
            {galleries.length === 0 && <EmptyRow colSpan={5}>Galeri yok.</EmptyRow>}
            {galleries.map((g) => (
              <tr key={g.id}>
                <Td className="font-semibold text-ink">{g.title}</Td>
                <Td className="text-ink-soft">{g.slug}</Td>
                <Td>{g._count.images}</Td>
                <Td className="text-xs text-ink-soft">{formatDate(g.createdAt)}</Td>
                <Td>
                  <div className="flex justify-end">
                    <DeleteButton id={g.id} action={deleteGalleryAction} />
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
