import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { ArticleForm } from "@/components/admin/ArticleForm";

export async function ArticleNewPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return (
    <>
      <PageHeader title="Yeni haber" description="Haberi yazın, görsel ekleyin, yayınlayın." />
      <ArticleForm categories={categories} />
    </>
  );
}
