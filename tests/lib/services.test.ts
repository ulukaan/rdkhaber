const FIXTURE = `<div class="vefat-grid"><div class="vefat-card"><div class="card-header"><h3 class="card-title">LEYLA SEZER</h3></div>
                    <div class="card-body"><div class="card-info-row"><span class="info-label">Baba Adı:</span>
                                <span class="info-value">YUSUF</span></div>
                            <div class="card-info-row"><span class="info-label">Anne Adı:</span>
                                <span class="info-value">HAT&#x130;CE</span></div><div class="card-info-row"><span class="info-label">Defin Tarihi:</span>
                                <span class="info-value">02.09.2026</span></div><div class="card-info-row"><span class="info-label">Ölüm Tarihi:</span>
                                <span class="info-value">01.09.2026</span></div><div class="card-info-row full-width"><span class="info-label">Cenaze Duyurusu:</span>
                                <span class="info-value">&#xD6;&#x11F;len Namaz&#x131;n&#x131; M&#xFC;teakip, &#x15E;ehitlik Camii'nde k&#x131;l&#x131;nacak cenaze namaz&#x131;n&#x131;n ard&#x131;ndan &#x15E;EH&#x130;R MEZARLI&#x11E;I'na defnedilecektir.</span></div><div class="card-info-row full-width"><span class="info-label">Cenaze Adresi:</span>
                                <span class="info-value">&#xC7;AY MAH. 541. SK. NO.:8 D&#xDC;ZCE</span></div></div><div class="mezarlik-banner"><span>&#x15E;EH&#x130;R MEZARLI&#x11E;I</span></div></div><div class="vefat-card"><div class="card-header"><h3 class="card-title">KEZBAN KARSON</h3></div>
                    <div class="card-body"><div class="card-info-row"><span class="info-label">Baba Adı:</span>
                                <span class="info-value">F&#x130;KR&#x130;</span></div></div></div></div>`;

import { describe, expect, it } from "vitest";
import { buildPharmacyWidgetUrl, DEFAULT_EZCANE_WIDGET_KEY } from "@/lib/pharmacy";
import {
  filterObituariesByBurialDate,
  parseObituariesFromHtml,
  parseTrDate,
} from "@/lib/obituaries";
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

describe("obituaries", () => {
  it("parses MEBIS vefat cards", () => {
    const entries = parseObituariesFromHtml(FIXTURE);
    expect(entries).toHaveLength(2);
    expect(entries[0]?.fullName).toBe("LEYLA SEZER");
    expect(entries[0]?.motherName).toBe("HATİCE");
    expect(entries[0]?.burialDate).toBe("02.09.2026");
    expect(entries[0]?.cemetery).toBe("ŞEHİR MEZARLIĞI");
    expect(entries[0]?.announcement).toContain("Şehitlik Camii");
  });

  it("parses tr date and filters by burial date", () => {
    expect(parseTrDate("02.09.2026")).toBe("2026-09-02");
    const entries = parseObituariesFromHtml(FIXTURE);
    expect(filterObituariesByBurialDate(entries, "2026-09-02")).toHaveLength(1);
  });
});
