import Link from "next/link";
import { Plus, Pencil, ListTree } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
import {
  PanelDesktopOnly,
  PanelMobileCard,
  PanelMobileCardBody,
  PanelMobileEmpty,
  PanelMobileList,
  PanelMobileOnly,
} from "@/components/admin/PanelMobileList";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { CategoryHeaderNavToggle } from "@/components/admin/CategoryHeaderNavToggle";
import { deleteCategoryAction } from "@/actions/category";
import { Button } from "@/components/ui/Button";
import {
  collectHeaderNavSlugs,
  getNavItemsForEdit,
} from "@/lib/nav-menu";

export const metadata = { title: "Kategoriler" };

export default async function CategoriesPage() {
  const [categories, headerNav] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ parentId: "asc" }, { order: "asc" }],
      include: {
        _count: { select: { articleLinks: true } },
        parent: { select: { name: true } },
      },
    }),
    getNavItemsForEdit("header"),
  ]);

  const inHeader = collectHeaderNavSlugs(headerNav);

  return (
    <>
      <PageHeader
        title="Kategoriler"
        description="Haber kategorilerini yönetin. Üst menü için satırdaki düğmeye tıklayın — anında kaydedilir."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button href="/admin/gorunum/menu" size="sm" variant="outline">
              <ListTree className="h-4 w-4" /> Üst menüyü düzenle
            </Button>
            <Button href="/admin/kategoriler/yeni" size="sm">
              <Plus className="h-4 w-4" /> Yeni Kategori
            </Button>
          </div>
        }
      />

      <PanelMobileOnly>
        {categories.length === 0 ? (
          <PanelMobileEmpty>Kategori yok.</PanelMobileEmpty>
        ) : (
          <PanelMobileList>
            {categories.map((c) => (
              <PanelMobileCard key={c.id}>
                <PanelMobileCardBody
                  footer={
                    <div className="panel-row-actions flex items-center justify-between gap-2">
                      <CategoryHeaderNavToggle categoryId={c.id} inNav={inHeader.has(c.slug)} />
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/kategoriler/${c.id}`}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border text-ink-soft active:text-brand"
                          aria-label="Düzenle"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <DeleteButton id={c.id} action={deleteCategoryAction} />
                      </div>
                    </div>
                  }
                >
                  <div className="flex items-center gap-2 font-semibold text-ink">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ background: c.color ?? "#d0021b" }}
                    />
                    {c.parent ? <span className="text-ink-soft">↳ </span> : null}
                    {c.name}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-ink-soft">
                    <span>Üst: {c.parent?.name ?? "—"}</span>
                    <span>Haber: {c._count.articleLinks}</span>
                    <span className="col-span-2 break-all">/{c.slug}</span>
                    <span>Sıra: {c.order}</span>
                  </div>
                </PanelMobileCardBody>
              </PanelMobileCard>
            ))}
          </PanelMobileList>
        )}
      </PanelMobileOnly>

      <PanelDesktopOnly>
        <Table>
          <thead>
            <tr>
              <Th>Ad</Th>
              <Th>Üst</Th>
              <Th>Slug</Th>
              <Th>Haber</Th>
              <Th>Sıra</Th>
              <Th>Üst menü</Th>
              <Th className="text-right">İşlemler</Th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && <EmptyRow colSpan={7}>Kategori yok.</EmptyRow>}
            {categories.map((c) => (
              <tr key={c.id}>
                <Td className="font-semibold text-ink">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ background: c.color ?? "#d0021b" }}
                    />
                    {c.parent ? <span className="text-ink-soft">↳ </span> : null}
                    {c.name}
                  </div>
                </Td>
                <Td className="text-ink-soft">{c.parent?.name ?? "—"}</Td>
                <Td className="text-ink-soft">{c.slug}</Td>
                <Td>{c._count.articleLinks}</Td>
                <Td>{c.order}</Td>
                <Td>
                  <CategoryHeaderNavToggle
                    categoryId={c.id}
                    inNav={inHeader.has(c.slug)}
                  />
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/kategoriler/${c.id}`}
                      className="text-ink-soft hover:text-brand"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeleteButton id={c.id} action={deleteCategoryAction} />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </PanelDesktopOnly>
    </>
  );
}
