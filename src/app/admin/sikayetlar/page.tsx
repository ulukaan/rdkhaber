import { listComplaintsAction } from "@/actions/content-complaint";
import { PageHeader } from "@/components/admin/PageHeader";
import { ComplaintsTable } from "@/components/admin/ComplaintsTable";

export const metadata = { title: "İçerik şikayetleri" };

export default async function ComplaintsAdminPage() {
  const items = await listComplaintsAction();

  return (
    <>
      <PageHeader title="İçerik şikayetleri" description="KVKK, telif ve düzeltme talepleri." />
      <ComplaintsTable items={items} />
    </>
  );
}
