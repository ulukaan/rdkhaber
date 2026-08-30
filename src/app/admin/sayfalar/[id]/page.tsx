import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { PageForm } from "@/components/admin/PageForm";

export const metadata = { title: "Sayfa Düzenle" };

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <>
      <PageHeader title="Sayfa Düzenle" />
      <PageForm defaults={page} />
    </>
  );
}
