import Link from "next/link";
import { Plus, Pencil, ListTree } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { Table, Th, Td, EmptyRow } from "@/components/admin/Table";
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
        _count: { select: { articles: true } },
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
              <Td className="flex items-center gap-2 font-semibold text-ink">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: c.color ?? "#d0021b" }}
                />
                {c.parent ? <span className="text-ink-soft">↳ </span> : null}
                {c.name}
              </Td>
              <Td className="text-ink-soft">{c.parent?.name ?? "—"}</Td>
              <Td className="text-ink-soft">{c.slug}</Td>
              <Td>{c._count.articles}</Td>
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
    </>
  );
}
