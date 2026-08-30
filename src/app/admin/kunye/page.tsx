import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/PageHeader";
import { PageForm } from "@/components/admin/PageForm";

export const metadata = { title: "Künye" };

export default async function KunyePage() {
  await getSettings();
  const page = await prisma.page.findUnique({ where: { slug: "kunye" } });

  return (
    <>
      <PageHeader
        title="Künye"
        description="Yayın künyesi sitede /sayfa/kunye adresinde görünür."
      />
      <PageForm
        defaults={
          page ?? {
            title: "Künye",
            slug: "kunye",
            content: "Yayın sahibi, sorumlu müdür ve iletişim bilgilerini buraya yazın.",
            published: true,
          }
        }
        redirectTo="/admin/kunye"
      />
    </>
  );
}
