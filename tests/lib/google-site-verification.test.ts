import { describe, expect, it } from "vitest";
import { normalizeGoogleSiteVerification } from "@/lib/google-site-verification";

describe("normalizeGoogleSiteVerification", () => {
  it("keeps a bare token", () => {
    expect(normalizeGoogleSiteVerification("BsMDGfNNCGCsN-aYqp7gtq0VqFZD7EH2tRB94iPr1PQ")).toBe(
      "BsMDGfNNCGCsN-aYqp7gtq0VqFZD7EH2tRB94iPr1PQ",
    );
  });

  it("strips google-site-verification= prefix", () => {
    expect(
      normalizeGoogleSiteVerification(
        "google-site-verification=BsMDGfNNCGCsN-aYqp7gtq0VqFZD7EH2tRB94iPr1PQ",
      ),
    ).toBe("BsMDGfNNCGCsN-aYqp7gtq0VqFZD7EH2tRB94iPr1PQ");
  });

  it("extracts content from a full meta tag", () => {
    expect(
      normalizeGoogleSiteVerification(
        '<meta name="google-site-verification" content="ABC123xyz" />',
      ),
    ).toBe("ABC123xyz");
  });

  it("returns empty for blank input", () => {
    expect(normalizeGoogleSiteVerification("   ")).toBe("");
  });
});
