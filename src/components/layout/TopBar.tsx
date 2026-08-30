import Link from "next/link";
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, Megaphone, Sun } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { TodayDate } from "@/components/layout/TodayDate";
import { CitySelect } from "@/components/layout/CitySelect";
import { whatsappUrl } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import type { WeatherSnapshot } from "@/lib/weather";
import type { PrayerSlot } from "@/lib/prayer-times";

const itemClass =
  "inline-flex items-center gap-1.5 font-semibold text-ink-soft transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand";

function WeatherIcon({ code }: { code: number }) {
  const cls = "h-3.5 w-3.5 shrink-0";
  if (code === 0 || code === 1) return <Sun className={cls} aria-hidden />;
  if (code === 45 || code === 48) return <CloudFog className={cls} aria-hidden />;
  if (code >= 71 && code <= 77) return <CloudSnow className={cls} aria-hidden />;
  if (code >= 95) return <CloudLightning className={cls} aria-hidden />;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return <CloudRain className={cls} aria-hidden />;
  }
  return <Cloud className={cls} aria-hidden />;
}

export function TopBar({
  whatsappNumber,
  citySlug,
  weather,
  nextPrayer,
}: {
  whatsappNumber: string;
  citySlug: string;
  weather?: WeatherSnapshot | null;
  nextPrayer?: PrayerSlot | null;
}) {
  return (
    <div className="hidden border-b border-border bg-surface md:block">
      <Container className="flex h-9 items-center justify-between gap-3 text-[11px] text-ink-soft">
        <div className="flex min-w-0 items-center gap-3 overflow-hidden">
          <TodayDate />
          <CitySelect value={citySlug} />
          {weather ? (
            <span
              className="weather-chip inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2 py-0.5 font-semibold tabular-nums"
              title={`${weather.city}: ${weather.label}`}
            >
              <WeatherIcon code={weather.code} />
              <span className="font-bold">{weather.temperature}°</span>
              <span className="hidden lg:inline">{weather.label}</span>
            </span>
          ) : null}
          {nextPrayer ? (
            <span
              className="inline-flex shrink-0 items-center gap-1.5 border-l border-border pl-3 font-semibold"
              title={`Sonraki namaz: ${nextPrayer.label}`}
            >
              <span className="text-ink-soft">{nextPrayer.label}</span>
              <span className="tabular-nums text-ink">{nextPrayer.time}</span>
            </span>
          ) : null}
        </div>
        <nav className="flex shrink-0 items-center gap-4" aria-label="Hızlı erişim">
          <Link href="/ihbar-hatti" className={itemClass}>
            <Megaphone className="h-3.5 w-3.5" aria-hidden />
            İhbar Hattı
          </Link>
          <a
            href={whatsappUrl(whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className={itemClass}
          >
            <WhatsAppIcon className="h-3.5 w-3.5" />
            WhatsApp
          </a>
          <Link href="/haber-gonder" className={itemClass}>
            Haber Gönder
          </Link>
        </nav>
      </Container>
    </div>
  );
}
