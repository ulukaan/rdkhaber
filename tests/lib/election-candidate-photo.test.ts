import { describe, expect, it } from "vitest";
import { buildCandidateAvatarUrl, normalizeCandidateKey, resolveCandidatePhotoUrl } from "@/lib/election-candidate-photo";

describe("election-candidate-photo", () => {
  it("yüklenmiş fotoğraf varsa onu kullanır", () => {
    const url = resolveCandidatePhotoUrl({
      name: "Faruk Özlü",
      partyName: "AK Parti",
      partyColor: "#ff9d00",
      photoUrl: "/uploads/faruk.jpg",
    });
    expect(url).toBe("/uploads/faruk.jpg");
  });

  it("fotoğraf yoksa parti renginde avatar üretir", () => {
    const url = resolveCandidatePhotoUrl({
      name: "Ayşe Demir",
      partyName: "CHP",
      partyColor: "#e30a17",
    });
    expect(url).toContain("ui-avatars.com");
    expect(url).toContain("background=e30a17");
  });

  it("buildCandidateAvatarUrl isim kodlar", () => {
    expect(buildCandidateAvatarUrl("Test Aday", "#123456")).toContain(encodeURIComponent("Test Aday"));
  });

  it("normalizeCandidateKey Türkçe karakterleri sadeleştirir", () => {
    expect(normalizeCandidateKey("Faruk Özlü")).toBe("FARUK OZLU");
  });
});
