import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { AuthorForm } from "@/components/admin/AuthorForm";

export const metadata = { title: "Yazarı Düzenle" };

export default async function EditAuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const author = await prisma.user.findFirst({
    where: { id, role: { in: ["EDITOR", "ADMIN"] } },
  });
  if (!author) notFound();

  return (
    <>
      <PageHeader title="Yazarı Düzenle" description={author.name} />
      <AuthorForm defaults={author} />
    </>
  );
}
