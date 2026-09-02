import { describe, expect, it } from "vitest";
import { parseAdsenseSnippet, resolveAdsenseSlot } from "@/lib/adsense";

describe("parseAdsenseSnippet", () => {
  it("reads slot from partial pasted snippet", () => {
    const code = `data-ad-layout="in-article"
data-ad-format="fluid"
data-ad-client="ca-pub-8308025356755851"
data-ad-slot="2422679742"></ins>`;

    expect(parseAdsenseSnippet(code)?.slot).toBe("2422679742");
  });

  it("reads slot without quotes", () => {
    expect(parseAdsenseSnippet('data-ad-slot=2422679742')?.slot).toBe("2422679742");
  });

  it("prefers manual slot field when code is empty", () => {
    expect(resolveAdsenseSlot({ code: "", slot: "2422679742" })).toBe("2422679742");
  });
});
