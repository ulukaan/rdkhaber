import { PageHeader } from "@/components/admin/PageHeader";
import { ElectionForm } from "@/components/admin/ElectionForm";

export const metadata = { title: "Yeni Seçim" };

export default function NewElectionPage() {
  return (
    <>
      <PageHeader title="Yeni seçim" description="Seçim merkezi sayfasını oluşturun; varsayılan Düzce ilçeleri eklenir." />
      <ElectionForm />
    </>
  );
}
