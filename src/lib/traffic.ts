import type { CityDef } from "@/lib/cities";
import { resolveCity } from "@/lib/cities";

/** Yandex trafik katmanlı harita widget URL'si. */
export function buildYandexTrafficWidgetUrl(city?: CityDef | string | null) {
  const def = typeof city === "string" || city == null ? resolveCity(city) : city;
  const ll = `${def.lon.toFixed(6)}%2C${def.lat.toFixed(6)}`;
  return `https://yandex.com.tr/map-widget/v1/?ll=${ll}&z=11&l=map%2Ctrf%2Crd&lang=tr_TR`;
}

export function buildGoogleTrafficUrl(city?: CityDef | string | null) {
  const def = typeof city === "string" || city == null ? resolveCity(city) : city;
  const q = encodeURIComponent(`${def.name}, Türkiye`);
  return `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=driving`;
}

export function buildGoogleTrafficMapUrl(city?: CityDef | string | null) {
  const def = typeof city === "string" || city == null ? resolveCity(city) : city;
  return `https://www.google.com/maps/@${def.lat},${def.lon},11z/data=!5m1!1e1`;
}
