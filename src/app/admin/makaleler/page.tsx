import { ArticleListPage } from "@/components/admin/pages/ArticleListPage";

export const metadata = { title: "Haberler" };

export default function Page() {
  return <ArticleListPage basePath="/admin/makaleler" bulkEnabled canDelete />;
}
