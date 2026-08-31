import { Plus } from "lucide-react";
import { getAllArticlesForPanel } from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { ArticleTable } from "@/components/admin/ArticleTable";
import { Button } from "@/components/ui/Button";

export async function ArticleListPage({
  basePath,
  filter,
  title = "Haberler",
  description = "Tüm haberleri yönetin.",
  bulkEnabled = false,
  canDelete = false,
}: {
  basePath: string;
  filter?: "archived" | "featured" | "breaking" | "video";
  title?: string;
  description?: string;
  bulkEnabled?: boolean;
  canDelete?: boolean;
}) {
  const [articles, categoryRows] = await Promise.all([
    getAllArticlesForPanel(filter),
    prisma.category.findMany({
      orderBy: [{ parentId: "asc" }, { order: "asc" }],
      select: { id: true, name: true, parent: { select: { name: true } } },
    }),
  ]);
  const categories = categoryRows.map((c) => ({
    id: c.id,
    name: c.parent ? `${c.parent.name} › ${c.name}` : c.name,
  }));

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          <Button href={`${basePath}/yeni`} size="sm">
            <Plus className="h-4 w-4" /> Yeni Haber
          </Button>
        }
      />
      <ArticleTable
        articles={articles}
        categories={categories}
        basePath={basePath}
        designBasePath={filter === "featured" ? basePath.replace("/makaleler", "/manset") : undefined}
        bulkEnabled={bulkEnabled}
        canDelete={canDelete}
      />
    </>
  );
}
