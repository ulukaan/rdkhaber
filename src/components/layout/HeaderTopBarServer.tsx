import { cookies } from "next/headers";
import { getSettings } from "@/lib/settings";
import { getPrayerTimes, getNextPrayerSlot } from "@/lib/prayer-times";
import { getCityWeather } from "@/lib/weather";
import { CITY_COOKIE, resolveCity } from "@/lib/cities";
import { TopBar } from "@/components/layout/TopBar";

export async function HeaderTopBarServer() {
  const cookieStore = await cookies();
  const city = resolveCity(cookieStore.get(CITY_COOKIE)?.value);

  const [settings, weather, prayers] = await Promise.all([
    getSettings(),
    getCityWeather(city),
    getPrayerTimes(city),
  ]);

  const nextPrayer = prayers ? getNextPrayerSlot(prayers) : null;

  return (
    <TopBar
      whatsappNumber={settings.whatsappNumber}
      citySlug={city.slug}
      weather={weather}
      nextPrayer={nextPrayer}
    />
  );
}
