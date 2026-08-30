import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata = { title: "Kategoriyi Düzenle" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category, parents] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({
      where: { id: { not: id } },
      orderBy: { order: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!category) notFound();

  return (
    <>
      <PageHeader title="Kategoriyi düzenle" description={category.name} />
      <CategoryForm defaults={category} parents={parents} />
    </>
  );
}
