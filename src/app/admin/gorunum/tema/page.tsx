import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/PageHeader";
import { ThemeSettingsForm } from "@/components/admin/ThemeSettingsForm";

export const metadata = { title: "Tema Ayarları" };

export default async function ThemePage() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader
        title="Tema Ayarları"
        description="Logo, site adı, slogan ve marka rengi."
      />
      <ThemeSettingsForm settings={settings} />
    </>
  );
}
