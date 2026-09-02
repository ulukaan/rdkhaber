import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Container } from "@/components/ui/Container";
import { StaticPageHeader } from "@/components/pages/StaticDocument";
import { ImsakiyePanel } from "@/components/services/ImsakiyePanel";
import {
  CITY_COOKIE,
  DEFAULT_CITY_SLUG,
  resolveCity,
} from "@/lib/cities";
import {
  currentMonthYearInIstanbul,
  getPrayerCalendar,
  getPrayerTimes,
} from "@/lib/prayer-times";

export const metadata: Metadata = {
  title: "İmsakiye",
  description: "Düzce ve Türkiye illeri için günlük namaz vakitleri ve aylık imsakiye tablosu.",
};

export default async function ImsakiyePage({
  searchParams,
}: {
  searchParams: Promise<{ il?: string; ay?: string; yil?: string }>;
}) {
  const { il, ay, yil } = await searchParams;
  const cookieStore = await cookies();
  const citySlug = il?.trim() || cookieStore.get(CITY_COOKIE)?.value || DEFAULT_CITY_SLUG;
  const city = resolveCity(citySlug);
  const current = currentMonthYearInIstanbul();
  const month = Number(ay);
  const year = Number(yil);
  const targetMonth = month >= 1 && month <= 12 ? month : current.month;
  const targetYear = year >= 2000 && year <= 2100 ? year : current.year;

  const [today, calendar] = await Promise.all([
    getPrayerTimes(city.slug),
    getPrayerCalendar(city.slug, targetMonth, targetYear),
  ]);

  return (
    <>
      <StaticPageHeader
        title="İmsakiye"
        eyebrow="Servis"
        description="Günlük namaz vakitlerini ve aylık imsakiye tablosunu il seçerek görüntüleyin."
      />
      <Container className="pb-10 pt-2">
        <ImsakiyePanel
          citySlug={city.slug}
          month={targetMonth}
          year={targetYear}
          today={today}
          calendar={calendar ?? []}
        />
      </Container>
    </>
  );
}
