import { describe, expect, it } from "vitest";
import { normalizePartyName, partySlugFromName } from "@/lib/election-party";

describe("election-party", () => {
  it("normalizes party names", () => {
    expect(normalizePartyName("  AK   Parti  ")).toBe("AK Parti");
  });

  it("maps known parties to stable slugs", () => {
    expect(partySlugFromName("CHP")).toBe("chp");
    expect(partySlugFromName("AK Parti")).toBe("ak-parti");
    expect(partySlugFromName("İYİ Parti")).toBe("iyi-parti");
    expect(partySlugFromName("Yeniden Refah")).toBe("yeniden-refah");
  });

  it("slugifies unknown parties", () => {
    expect(partySlugFromName("Zafer Partisi")).toBe("zafer-partisi");
  });
});
