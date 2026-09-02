import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Container } from "@/components/ui/Container";
import { StaticPageHeader } from "@/components/pages/StaticDocument";
import { TrafficMap } from "@/components/services/TrafficMap";
import { CITY_COOKIE, DEFAULT_CITY_SLUG } from "@/lib/cities";

export const metadata: Metadata = {
  title: "Trafik Haritası",
  description: "Düzce ve çevresinde canlı trafik yoğunluğu harita üzerinden.",
};

export default async function TrafficPage() {
  const cookieStore = await cookies();
  const citySlug = cookieStore.get(CITY_COOKIE)?.value ?? DEFAULT_CITY_SLUG;

  return (
    <>
      <StaticPageHeader
        title="Trafik Haritası"
        eyebrow="Servis"
        description="Canlı trafik yoğunluğunu harita üzerinden takip edin. Renkler yol durumunu gösterir."
      />
      <Container className="pb-10 pt-2">
        <TrafficMap initialCity={citySlug} />
      </Container>
    </>
  );
}
