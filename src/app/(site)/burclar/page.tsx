import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { HoroscopeStrip } from "@/components/home/HoroscopeStrip";
import { getDailyHoroscopes } from "@/lib/horoscope";

export const metadata: Metadata = { title: "Burç Yorumları" };

export default async function HoroscopePage() {
  const items = await getDailyHoroscopes();

  return (
    <Container className="py-8">
      <h1 className="text-2xl font-extrabold text-ink md:text-3xl">Burç Yorumları</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Günlük burç yorumlarını buradan takip edin.
      </p>
      {items.length > 0 ? (
        <div className="mt-6">
          <HoroscopeStrip items={items} />
        </div>
      ) : (
        <p className="mt-8 border border-dashed border-border bg-surface p-8 text-sm text-ink-soft">
          Burç yorumları şu anda yüklenemedi. Lütfen daha sonra yeniden deneyin.
        </p>
      )}
    </Container>
  );
}
