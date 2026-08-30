import { ArticleEditPage } from "@/components/admin/pages/ArticleEditPage";

export const metadata = { title: "Haberi Düzenle" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ArticleEditPage id={id} />;
}
