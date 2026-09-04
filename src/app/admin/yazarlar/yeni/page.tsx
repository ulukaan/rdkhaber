import { PageHeader } from "@/components/admin/PageHeader";
import { AuthorForm } from "@/components/admin/AuthorForm";

export const metadata = { title: "Yeni Yazar" };

export default function NewAuthorPage() {
  return (
    <>
      <PageHeader
        title="Yeni Yazar"
        description="Eklenen yazar anasayfa ve /yazarlar listesinde görünür. Haberi varsa son yazısı da listelenir."
      />
      <AuthorForm />
    </>
  );
}
