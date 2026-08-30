import { PageHeader } from "@/components/admin/PageHeader";
import { PageForm } from "@/components/admin/PageForm";

export const metadata = { title: "Yeni Sayfa" };

export default function NewPage() {
  return (
    <>
      <PageHeader title="Yeni Sayfa" />
      <PageForm />
    </>
  );
}
