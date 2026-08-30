import { ArticleListPage } from "@/components/admin/pages/ArticleListPage";

export const metadata = { title: "Arşiv" };

export default function Page() {
  return (
    <ArticleListPage
      basePath="/admin/makaleler"
      filter="archived"
      title="Arşiv"
      description="Arşivlenmiş haberler."
    />
  );
}
