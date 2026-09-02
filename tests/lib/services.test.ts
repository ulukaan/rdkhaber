import { describe, expect, it } from "vitest";
import { buildPharmacyWidgetUrl, DEFAULT_EZCANE_WIDGET_KEY } from "@/lib/pharmacy";
import { buildYandexTrafficWidgetUrl } from "@/lib/traffic";

describe("service urls", () => {
  it("builds pharmacy widget url with district", () => {
    const url = buildPharmacyWidgetUrl("akcakoca");
    expect(url).toContain(DEFAULT_EZCANE_WIDGET_KEY);
    expect(url).toContain("ilce=Ak%C3%A7akoca");
  });

  it("builds yandex traffic widget for Düzce", () => {
    const url = buildYandexTrafficWidgetUrl("duzce");
    expect(url).toContain("yandex.com.tr/map-widget");
    expect(url).toContain("trf");
  });
});
