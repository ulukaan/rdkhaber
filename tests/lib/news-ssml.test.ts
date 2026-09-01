import { describe, expect, it } from "vitest";
import { NEWS_STYLEDEGREE, toNewsAnchorSsml } from "@/lib/news-ssml";
import { cardinal, ordinal, toSpokenNewsText, yearWords } from "@/lib/speech-text";

describe("toSpokenNewsText", () => {
  it("tarih, saat, yüzde ve sıra sayılarını konuşma metnine çevirir", () => {
    expect(toSpokenNewsText("30 Ağustos 2026")).toBe("otuz ağustos iki bin yirmi altı");
    expect(toSpokenNewsText("19 Mayıs 1919")).toBe("on dokuz mayıs bin dokuz yüz on dokuz");
    expect(toSpokenNewsText("14:30")).toBe("saat on dört otuz");
    expect(toSpokenNewsText("saat 14.30")).toBe("saat on dört otuz");
    expect(toSpokenNewsText("%25")).toBe("yüzde yirmi beş");
    expect(toSpokenNewsText("100. Yıl")).toBe("yüzüncü yıl");
  });

  it("kısaltmaları açar ve virgüllü sayıları okutur", () => {
    expect(toSpokenNewsText("Dr. Ahmet 12,5 kilometre yürüdü.")).toContain("Doktor Ahmet on iki virgül beş kilometre");
    expect(toSpokenNewsText("1.250 TL")).toBe("bin iki yüz elli Türk lirası");
    expect(toSpokenNewsText("25.000 TL")).toBe("yirmi beş bin Türk lirası");
  });

  it("kısaltmaları bağlama ve ekleriyle açar", () => {
    expect(toSpokenNewsText("Samet FK, Düzce'de şampiyon oldu.")).toBe(
      "Samet Futbol Kulübü, Düzce'de şampiyon oldu.",
    );
    expect(toSpokenNewsText("Düzce FK yeni transferini açıkladı.")).toContain("Düzce Futbol Kulübü");
    expect(toSpokenNewsText("TFF'nin saat 14.30'da yaptığı açıklamada...")).toBe(
      "Türkiye Futbol Federasyonu'nun saat on dört otuzda yaptığı açıklamada.",
    );
    expect(toSpokenNewsText("ABC San. ve Tic. A.Ş.")).toBe("ABC Sanayi ve Ticaret Anonim Şirketi");
    expect(toSpokenNewsText("Dr. Mehmet Yılmaz açıklama yaptı.")).toContain("Doktor Mehmet Yılmaz");
  });

  it("aynı sayıyı bağlama göre farklı okur", () => {
    expect(toSpokenNewsText("100. Yıl")).toBe("yüzüncü yıl");
    expect(toSpokenNewsText("100 kişi")).toBe("yüz kişi");
    expect(toSpokenNewsText("100 km")).toBe("yüz kilometre");
    expect(toSpokenNewsText("29. dönem")).toBe("yirmi dokuzuncu dönem");
    expect(toSpokenNewsText("Atatürk Cad. No: 15")).toBe("Atatürk Caddesi, numara on beş");
  });
});

describe("cardinal / year / ordinal", () => {
  it("Türkçe sayı okunuşunu üretir", () => {
    expect(cardinal(30)).toBe("otuz");
    expect(cardinal(2026)).toBe("iki bin yirmi altı");
    expect(yearWords(1919)).toBe("bin dokuz yüz on dokuz");
    expect(ordinal(100)).toBe("yüzüncü");
  });
});

describe("toNewsAnchorSsml", () => {
  const ssml = toNewsAnchorSsml(
    "Düzce'de bugün önemli bir gelişme yaşandı.\n\nYetkililer tarafından yapılan açıklamada, çalışmaların kısa süre içerisinde başlayacağı belirtildi.\n\nDetaylar haberimizde.",
    "tr-TR-EmelNeural",
    null,
    NEWS_STYLEDEGREE,
  );

  it("Türkiye Türkçesi locale ile doğal haber SSML üretir", () => {
    expect(ssml).toContain('xml:lang="tr-TR"');
    expect(ssml).toContain('<lang xml:lang="tr-TR">');
    expect(ssml).toContain('name="tr-TR-EmelNeural"');
    expect(ssml).toContain('rate="98%"');
    expect(ssml).not.toContain("pitch=");
    expect(ssml).not.toContain("<emphasis");
    expect(ssml).not.toContain("<s>");
    expect(ssml).not.toContain("<break");
    expect(ssml).not.toContain("express-as");
  });
});
