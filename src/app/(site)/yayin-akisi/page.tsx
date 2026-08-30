import { Container } from "@/components/ui/Container";
import { TvGuideClient } from "@/components/home/TvGuideClient";
import { getTvSchedules } from "@/lib/broadcast";
import { getSettings, parseTvGuideDesign } from "@/lib/settings";

export const metadata = { title: "Yayın Akışı" };

export default async function YayinAkisiPage({
  searchParams,
}: {
  searchParams: Promise<{ kanal?: string }>;
}) {
  const [{ kanal }, schedules, settings] = await Promise.all([
    searchParams,
    getTvSchedules(),
    getSettings(),
  ]);

  return (
    <Container className="py-5 sm:py-7">
      <TvGuideClient
        schedules={schedules}
        initialSlug={kanal}
        design={parseTvGuideDesign(settings.tvGuideDesign)}
        title={settings.tvPageTitle || "Yayın Akışı"}
        intro={settings.tvPageIntro}
      />
    </Container>
  );
}
