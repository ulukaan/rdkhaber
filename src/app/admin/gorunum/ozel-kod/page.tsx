import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/PageHeader";
import { CustomCodeForm } from "@/components/admin/CustomCodeForm";

export const metadata = { title: "Özel Kod Alanları" };

export default async function CustomCodePage() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader
        title="Özel Kod Alanları"
        description="Analitik, doğrulama veya özel script. Yalnızca yönetici."
      />
      <CustomCodeForm
        customHeadHtml={settings.customHeadHtml}
        customBodyEndHtml={settings.customBodyEndHtml}
      />
    </>
  );
}
