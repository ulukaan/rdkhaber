import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { StaticPageHeader } from "@/components/pages/StaticDocument";
import { ObituaryList } from "@/components/services/ObituaryList";
import { fetchObituaries, todayIsoInIstanbul } from "@/lib/obituaries";

export const metadata: Metadata = {
  title: "Vefat Edenler",
  description: "Düzce’de günlük vefat ve cenaze duyuruları — defin tarihi, adres ve program bilgileri.",
};

export default async function ObituaryPage({
  searchParams,
}: {
  searchParams: Promise<{ tarih?: string }>;
}) {
  const { tarih } = await searchParams;
  const today = todayIsoInIstanbul();
  const selectedDate = tarih?.trim().match(/^\d{4}-\d{2}-\d{2}$/) ? tarih.trim() : today;
  const entries = await fetchObituaries();

  return (
    <>
      <StaticPageHeader
        title="Vefat Edenler"
        eyebrow="Servis"
        description="Günlük vefat ve cenaze duyurularını defin tarihine göre görüntüleyin."
      />
      <Container className="pb-10 pt-2">
        <ObituaryList
          key={selectedDate}
          maxDate={today}
          initialSelectedDate={selectedDate}
          entries={entries}
        />
      </Container>
    </>
  );
}
