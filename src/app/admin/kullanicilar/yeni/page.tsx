import { PageHeader } from "@/components/admin/PageHeader";
import { UserForm } from "@/components/admin/UserForm";

export const metadata = { title: "Yeni Kullanıcı" };

export default function Page() {
  return (
    <>
      <PageHeader title="Yeni Kullanıcı" />
      <UserForm />
    </>
  );
}
