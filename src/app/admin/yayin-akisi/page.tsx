import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/PageHeader";
import { TvGuideSettingsForm } from "@/components/admin/TvGuideSettingsForm";

export const metadata = { title: "Yayın Akışı" };

export default async function AdminTvGuidePage() {
  const settings = await getSettings();

  return (
    <>
      <PageHeader
        title="Yayın Akışı"
        description="Kanal listesi, sayfa metinleri ve anasayfa şeridini buradan yönetin. Programlar otomatik güncellenir."
      />
      <TvGuideSettingsForm settings={settings} />
    </>
  );
}
