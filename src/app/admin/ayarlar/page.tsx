import { getSettingsForAdmin } from "@/lib/settings";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Ayarlar" };

export default async function SettingsPage() {
  const settings = await getSettingsForAdmin();

  return (
    <>
      <PageHeader title="Site Ayarları" description="WhatsApp, ihbar hattı ve site bilgileri." />
      <SettingsForm settings={settings} />
    </>
  );
}
