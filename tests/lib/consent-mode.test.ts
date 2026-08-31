import { describe, expect, it } from "vitest";
import { consentStateToMode } from "@/lib/consent-mode";
import { acceptAllConsent, rejectOptionalConsent } from "@/lib/cookie-consent";

describe("consentStateToMode", () => {
  it("varsayılan reddedilmiş reklam/analiz bayrakları döner", () => {
    const mode = consentStateToMode(rejectOptionalConsent());
    expect(mode.ad_storage).toBe("denied");
    expect(mode.analytics_storage).toBe("denied");
  });

  it("tümünü kabul ettiğinde granted bayrakları döner", () => {
    const mode = consentStateToMode(acceptAllConsent());
    expect(mode.ad_storage).toBe("granted");
    expect(mode.ad_user_data).toBe("granted");
    expect(mode.analytics_storage).toBe("granted");
  });
});
