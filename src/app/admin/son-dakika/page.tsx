import { ArticleListPage } from "@/components/admin/pages/ArticleListPage";

export const metadata = { title: "Üst Manşetler" };

export default function Page() {
  return (
    <ArticleListPage
      basePath="/admin/makaleler"
      filter="breaking"
      title="Üst Manşetler"
      description="Son dakika olarak işaretlenen haberler."
    />
  );
}
