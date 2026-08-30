import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/PageHeader";
import { HomepageModulesForm } from "@/components/admin/HomepageModulesForm";

export const metadata = { title: "Öğeler" };

export default async function ModulesPage() {
  const [settings, categories] = await Promise.all([
    getSettings(),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { name: true, slug: true },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="Öğeler"
        description="Ana sayfa ve üst şeritte hangi blokların duracağını seçin."
      />
      <HomepageModulesForm settings={settings} categories={categories} />
    </>
  );
}
