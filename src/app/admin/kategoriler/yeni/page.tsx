import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata = { title: "Yeni Kategori" };

export default async function Page() {
  const parents = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });

  return (
    <>
      <PageHeader title="Yeni kategori" description="Haber sınıflandırması ve kategori sayfası." />
      <CategoryForm parents={parents} />
    </>
  );
}
