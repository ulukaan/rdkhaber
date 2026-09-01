import { describe, expect, it } from "vitest";
import {
  buildCandidateAvatarUrl,
  buildNtvCandidatePhotoUrl,
  buildNtvPartyLogoUrl,
  resolveNtvPartyLogoUrl,
  resolvePartyColor,
  normalizeCandidateKey,
  resolveCandidatePhotoSources,
  resolveCandidatePhotoUrl,
  resolveNtvPartyId,
} from "@/lib/election-candidate-photo";

describe("election-candidate-photo", () => {
  it("yüklenmiş fotoğraf varsa onu kullanır", () => {
    const url = resolveCandidatePhotoUrl({
      name: "Faruk Özlü",
      partyName: "AK Parti",
      partyColor: "#ff7200",
      photoUrl: "/uploads/faruk.jpg",
    });
    expect(url).toBe("/uploads/faruk.jpg");
  });

  it("fotoğraf yoksa NTV aday.svg veya avatar üretir", () => {
    const url = resolveCandidatePhotoUrl({
      name: "Ayşe Demir",
      partyName: "CHP",
      partyColor: "#a90000",
    });
    expect(url).toContain("/aday.svg");
  });

  it("NTV resmi parti renklerini döndürür", () => {
    expect(resolvePartyColor("AK Parti")).toBe("#ff7200");
    expect(resolvePartyColor("CHP")).toBe("#a90000");
    expect(resolvePartyColor("MHP")).toBe("#ee1d23");
    expect(resolvePartyColor("İYİ Parti")).toBe("#0f94ca");
    expect(resolvePartyColor("DEM Parti")).toBe("#9a007e");
    expect(resolvePartyColor("Yeniden Refah")).toBe("#007d60");
  });

  it("NTV parti logosu URL formatını üretir", () => {
    expect(buildNtvPartyLogoUrl(1)).toBe(
      "https://secim2024-storage.ntv.com.tr/secimsonuc2024/live/assets/img/party/1.svg?v=1.0.9",
    );
    expect(resolveNtvPartyLogoUrl("AK Parti")).toContain("/party/1.svg");
  });

  it("NTV URL formatını üretir", () => {
    const url = buildNtvCandidatePhotoUrl({ cityId: 34, partyId: 18, raceType: "MAYOR" });
    expect(url).toBe(
      "https://secim2024-storage.ntv.com.tr/secimsonuc2024/live/assets/img/candidate/ec_34_c_0_t_0_p_18.png?v=1.0.9",
    );
  });

  it("Düzce belediyesi fotoğrafları c_190 kullanır", () => {
    const url = buildNtvCandidatePhotoUrl({ cityId: 81, partyId: 1, raceType: "MAYOR" });
    expect(url).toContain("ec_81_c_190_t_0_p_1.png");
  });

  it("il ve parti kodu varsa NTV URL'sini birincil kaynak yapar", () => {
    const { src, fallback } = resolveCandidatePhotoSources({
      name: "Faruk Özlü",
      partyName: "AK Parti",
      partyColor: "#ff7200",
      ntvCityId: 81,
    });
    expect(src).toContain("ec_81_c_190_t_0_p_1.png");
    expect(fallback).toContain("/aday.svg");
  });

  it("fotoğraf yoksa NTV aday.svg placeholder kullanır", () => {
    const { src, fallback } = resolveCandidatePhotoSources({
      name: "Davut Güloğlu",
      partyName: "Yeniden Refah",
      partyColor: "#007d60",
    });
    expect(src).toContain("/aday.svg");
    expect(fallback).toContain("/aday.svg");
  });

  it("parti kodunu çözümler", () => {
    expect(resolveNtvPartyId("AK Parti")).toBe(1);
    expect(resolveNtvPartyId("Yeniden Refah")).toBe(8);
    expect(resolveNtvPartyId("CHP")).toBe(18);
  });

  it("buildCandidateAvatarUrl isim kodlar", () => {
    expect(buildCandidateAvatarUrl("Test Aday", "#123456")).toContain(encodeURIComponent("Test Aday"));
  });

  it("normalizeCandidateKey Türkçe karakterleri sadeleştirir", () => {
    expect(normalizeCandidateKey("Faruk Özlü")).toBe("FARUK OZLU");
  });
});
