import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { ArticleForm } from "@/components/admin/ArticleForm";

export async function ArticleNewPage({
  searchParams,
}: {
  searchParams?: Promise<{ hizli?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const quickMode = params.hizli === "1" || params.hizli === "true";

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return (
    <>
      <PageHeader
        title={quickMode ? "Hızlı haber" : "Yeni haber"}
        description={
          quickMode
            ? "Başlığı yazın, spot ve metni girin — yan ayarlar gerektiğinde açılır."
            : "Haberi yazın, görsel ekleyin, yayınlayın."
        }
      />
      <ArticleForm categories={categories} quickMode={quickMode} />
    </>
  );
}
