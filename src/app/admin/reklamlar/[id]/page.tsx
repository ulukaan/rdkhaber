import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdForm } from "@/components/admin/AdForm";

export const metadata = { title: "Reklam Düzenle" };

export default async function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ad = await prisma.adSlot.findUnique({ where: { id } });
  if (!ad) notFound();

  return (
    <>
      <PageHeader title="Reklam Düzenle" />
      <AdForm defaults={ad} />
    </>
  );
}
