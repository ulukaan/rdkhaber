import { describe, expect, it } from "vitest";
import {
  DUZCE_IL_ID,
  normalizeYskParty,
  normalizeYskPlace,
  readYskVoteColumn,
  resolveYskConfig,
  YSK_SECIM,
  YSK_SECIM_TURU,
} from "@/lib/ysk-api";
import { mergeYskCandidates } from "@/lib/ysk-sync";

describe("ysk-api helpers", () => {
  it("varsayılan YSK yapılandırması Düzce 2024 yerel seçim", () => {
    const config = resolveYskConfig();
    expect(config.secimId).toBe(YSK_SECIM.YEREL_2024);
    expect(config.secimTuru).toBe(YSK_SECIM_TURU.BELEDIYE_BASKANLIGI);
    expect(config.ilId).toBe(DUZCE_IL_ID);
    expect(config.focusIlce).toBe("DÜZCE MERKEZ");
  });

  it("yer ve parti adlarını normalize eder", () => {
    expect(normalizeYskPlace("  düzce   merkez ")).toBe("DÜZCE MERKEZ");
    expect(normalizeYskParty("Adalet ve Kalkınma Partisi")).toBe("ADALET VE KALKINMA");
  });

  it("oy kolonlarını sayıya çevirir", () => {
    const row = { parti1_ALDIGI_OY: "120", parti2_ALDIGI_OY: 45 };
    expect(readYskVoteColumn(row, "parti1_ALDIGI_OY")).toBe(120);
    expect(readYskVoteColumn(row, "parti2_ALDIGI_OY")).toBe(45);
    expect(readYskVoteColumn(row, "parti99_ALDIGI_OY")).toBe(0);
  });
});

describe("ysk-sync merge", () => {
  it("mevcut aday fotoğrafını koruyarak oyları günceller", () => {
    const existing = [
      {
        name: "Faruk Özlü",
        partyName: "AK Parti",
        partyColor: "#ff9d00",
        photoUrl: "/uploads/faruk.jpg",
        slogan: "Düzce için",
        bio: null,
        votes: 0,
        votePct: 0,
      },
    ];
    const incoming = [
      {
        raceType: "MAYOR" as const,
        name: "FARUK ÖZLÜ",
        partyName: "AK Parti",
        partyColor: "#ff9d00",
        votes: 50_000,
        votePct: 40,
      },
    ];
    const merged = mergeYskCandidates(existing, incoming);
    expect(merged[0]?.votes).toBe(50_000);
    expect(merged[0]?.photoUrl).toBe("/uploads/faruk.jpg");
    expect(merged[0]?.slogan).toBe("Düzce için");
  });
});
