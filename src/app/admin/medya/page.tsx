import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { MediaGrid } from "@/components/admin/MediaGrid";

export const metadata = { title: "Medya" };

export default async function MediaPage() {
  const session = await auth();
  const items = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { name: true } } },
  });

  const totalSize = items.reduce((sum, m) => sum + m.size, 0);
  const hashCounts = new Map<string, number>();
  for (const item of items) {
    if (!item.contentHash) continue;
    hashCounts.set(item.contentHash, (hashCounts.get(item.contentHash) ?? 0) + 1);
  }
  const duplicateHashes = new Set(
    [...hashCounts.entries()].filter(([, count]) => count > 1).map(([hash]) => hash),
  );
  const duplicateCount = [...hashCounts.values()].reduce((sum, count) => sum + Math.max(0, count - 1), 0);

  return (
    <>
      <PageHeader
        title="Medya Kütüphanesi"
        description={
          items.length > 0
            ? `${items.length} dosya · ${(totalSize / (1024 * 1024)).toFixed(1)} MB${
                duplicateCount > 0 ? ` · ${duplicateCount} olası kopya` : ""
              } · WebP sıkıştırma açık`
            : "Görseller WebP olarak sıkıştırılır; aynı dosya tekrar yüklenmez."
        }
      />
      <MediaGrid
        isAdmin={session?.user?.role === "ADMIN"}
        duplicateHashes={duplicateHashes}
        items={items.map((m) => ({
          id: m.id,
          url: m.url,
          filename: m.filename,
          mimeType: m.mimeType,
          size: m.size,
          contentHash: m.contentHash,
          createdAt: m.createdAt,
          uploadedByName: m.uploadedBy?.name ?? null,
        }))}
      />
    </>
  );
}
