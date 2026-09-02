import { PageHeader } from "@/components/admin/PageHeader";
import { CompanyForm } from "@/components/admin/CompanyForm";

export const metadata = { title: "Yeni Firma" };

export default function NewCompanyPage() {
  return (
    <>
      <PageHeader title="Yeni Firma" />
      <CompanyForm />
    </>
  );
}
