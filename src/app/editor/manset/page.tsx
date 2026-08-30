import { ArticleListPage } from "@/components/admin/pages/ArticleListPage";

export const metadata = { title: "Ana Manşetler" };

export default function Page() {
  return (
    <ArticleListPage
      basePath="/editor/makaleler"
      filter="featured"
      title="Ana Manşetler"
      description="Öne çıkan haberler. Manşet tasarımı ile kart görünümünü düzenleyin."
    />
  );
}
