import { ArticleNewPage } from "@/components/admin/pages/ArticleNewPage";

export const metadata = { title: "Yeni Haber" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ hizli?: string }>;
}) {
  return <ArticleNewPage searchParams={searchParams} />;
}
