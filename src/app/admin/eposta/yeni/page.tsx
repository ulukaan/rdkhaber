import { PageHeader } from "@/components/admin/PageHeader";
import { MailboxNav } from "@/components/admin/MailboxNav";
import { MailboxComposeForm } from "@/components/admin/MailboxComposeForm";

export const metadata = { title: "Yeni e-posta" };

export default async function MailboxComposePage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const { to } = await searchParams;

  return (
    <>
      <PageHeader title="Yeni e-posta" description="Alıcı seçin, mesajınızı yazın ve gönderin." />
      <MailboxNav pathname="/admin/eposta/yeni" />
      <MailboxComposeForm defaultTo={to ?? ""} />
    </>
  );
}
