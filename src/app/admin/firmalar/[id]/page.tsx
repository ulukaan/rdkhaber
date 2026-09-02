import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { CompanyForm } from "@/components/admin/CompanyForm";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Firma Düzenle" };

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) notFound();

  return (
    <>
      <PageHeader title="Firma Düzenle" />
      <CompanyForm
        defaults={{
          id: company.id,
          name: company.name,
          logoUrl: company.logoUrl,
          websiteUrl: company.websiteUrl,
          category: company.category,
          phone: company.phone,
          description: company.description,
          order: company.order,
          active: company.active,
        }}
      />
    </>
  );
}
