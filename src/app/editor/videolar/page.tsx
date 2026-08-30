import { ArticleListPage } from "@/components/admin/pages/ArticleListPage";

export const metadata = { title: "Videolar" };

export default function Page() {
  return (
    <ArticleListPage
      basePath="/editor/makaleler"
      filter="video"
      title="Videolar"
      description="Video bağlantısı olan haberler."
    />
  );
}
