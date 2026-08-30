import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { MediaGrid } from "@/components/admin/MediaGrid";

export const metadata = { title: "Medya" };

export default async function MediaPage() {
  const items = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { name: true } } },
  });

  const totalSize = items.reduce((sum, m) => sum + m.size, 0);

  return (
    <>
      <PageHeader
        title="Medya Kütüphanesi"
        description={
          items.length > 0
            ? `${items.length} dosya · toplam ${(totalSize / (1024 * 1024)).toFixed(1)} MB`
            : "Haber ve galeri formlarından yüklenen görseller burada toplanır."
        }
      />
      <MediaGrid
        items={items.map((m) => ({
          id: m.id,
          url: m.url,
          filename: m.filename,
          mimeType: m.mimeType,
          size: m.size,
          createdAt: m.createdAt,
          uploadedByName: m.uploadedBy?.name ?? null,
        }))}
      />
    </>
  );
}
