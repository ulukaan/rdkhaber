import { describe, expect, it } from "vitest";
import { buildSharePostCopy, formatSharePostDate } from "@/lib/share-post";

describe("buildSharePostCopy", () => {
  it("başlık, kategori, tarih ve özeti karta yerleştirir", () => {
    const copy = buildSharePostCopy({
      title: "Rusya–Ukrayna savaşında diplomasi yeniden kilitlendi",
      summary:
        "Rusya Dışişleri Bakanı Sergey Lavrov açıklama istedi. Rusya–Ukrayna barış görüşmeleri ise Şubat ayından bu yana yapılmadı.",
      categoryName: "Gündem",
      publishedAt: new Date("2026-08-15T12:00:00+03:00"),
      headlineSub: "Enerji piyasalarındaki riskler artıyor.\nABD’nin Ukrayna politikası izlenmeli.",
    });
    expect(copy.category).toBe("GÜNDEM");
    expect(copy.dateLabel).toContain("Ağustos");
    expect(copy.dateLabel).toContain("2026");
    expect(copy.lead).toContain("Lavrov");
    expect(copy.whyMain).toContain("Enerji");
    expect(copy.whyWatch).toContain("ABD");
  });

  it("özet cümlelerini NEDEN ÖNEMLİ için kullanır", () => {
    const copy = buildSharePostCopy({
      title: "Düzce FK şampiyon oldu",
      summary: "Takım kupayı kaldırdı. Bu sonuç lig sıralamasını değiştirdi.",
      categoryName: "Spor",
      publishedAt: new Date("2026-08-15T12:00:00+03:00"),
    });
    expect(copy.lead).toContain("kupayı");
    expect(copy.whyMain).toContain("lig sıralamasını");
  });
});

describe("formatSharePostDate", () => {
  it("Türkçe gün adıyla yazar", () => {
    const label = formatSharePostDate(new Date("2026-08-15T12:00:00+03:00"));
    expect(label).toMatch(/15 Ağustos 2026/);
    expect(label.toLocaleLowerCase("tr-TR")).toContain("cumartesi");
  });
});
