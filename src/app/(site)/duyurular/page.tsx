import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { StaticPageHeader } from "@/components/pages/StaticDocument";
import { AnnouncementList } from "@/components/services/AnnouncementList";
import { fetchMunicipalityAnnouncements } from "@/lib/municipality-announcements";

export const metadata: Metadata = {
  title: "Duyurular",
  description: "Düzce’de güncel duyurular, su kesintisi ve altyapı bildirimleri.",
};

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; altyapi?: string }>;
}) {
  const { q, altyapi } = await searchParams;
  const items = await fetchMunicipalityAnnouncements();

  return (
    <>
      <StaticPageHeader
        title="Duyurular"
        eyebrow="Servis"
        description="Güncel duyuruları takip edin; su kesintisi ve altyapı bildirimlerini filtreleyebilirsiniz."
      />
      <Container className="pb-10 pt-2">
        <AnnouncementList
          items={items}
          initialQuery={q?.trim() ?? ""}
          initialUtilityOnly={altyapi === "1"}
        />
      </Container>
    </>
  );
}
