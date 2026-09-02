import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { AnnouncementDetailView } from "@/components/services/AnnouncementDetail";
import { fetchMunicipalityAnnouncement } from "@/lib/municipality-announcements";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await fetchMunicipalityAnnouncement(slug);
  if (!detail) return { title: "Duyuru bulunamadı" };
  return {
    title: detail.title,
    description: detail.title,
  };
}

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detail = await fetchMunicipalityAnnouncement(slug);
  if (!detail) notFound();

  return (
    <Container className="py-8 sm:py-10">
      <AnnouncementDetailView detail={detail} />
    </Container>
  );
}
