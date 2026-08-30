import { ArticleSuccessPage } from "@/components/admin/pages/ArticleSuccessPage";

export const metadata = { title: "Haber kaydedildi" };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ islem?: string }>;
}) {
  const { id } = await params;
  const { islem } = await searchParams;
  return <ArticleSuccessPage id={id} basePath="/editor/makaleler" islem={islem} />;
}
