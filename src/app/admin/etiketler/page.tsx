import { Tags } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { TagQuickAdd } from "@/components/admin/TagQuickAdd";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { EmptyState, PanelCard, SectionHeader } from "@/components/admin/PanelUI";
import { deleteTagAction } from "@/actions/tag";
import { Badge } from "@/components/ui/Badge";
import { FormCard } from "@/components/admin/FormCard";

export const metadata = { title: "Etiketler" };

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <>
      <PageHeader title="Etiketler" description="Haberlerde kullanılan etiketleri yönetin." />

      <FormCard title="Etiket ekle" description="Hızlı ekleme." Icon={Tags} className="mb-6 max-w-xl">
        <TagQuickAdd />
      </FormCard>

      <SectionHeader title="Tüm etiketler" description={`${tags.length} kayıt`} />

      {tags.length === 0 ? (
        <EmptyState title="Henüz etiket yok" description="Yukarıdan ilk etiketi ekleyebilirsiniz." />
      ) : (
        <PanelCard padding={false}>
          <div className="flex flex-wrap gap-2 p-5">
            {tags.map((t) => (
              <span
                key={t.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5"
              >
                <span className="text-sm font-semibold text-ink">{t.name}</span>
                <Badge variant="outline">{t._count.articles}</Badge>
                <DeleteButton id={t.id} action={deleteTagAction} />
              </span>
            ))}
          </div>
        </PanelCard>
      )}
    </>
  );
}
