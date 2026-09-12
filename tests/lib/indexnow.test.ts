import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { getIndexNowKey, getIndexNowKeyLocation, submitUrlsToIndexNow } from "@/lib/indexnow";

describe("indexnow", () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env = { ...env };
    delete process.env.INDEXNOW_KEY;
    delete process.env.AUTH_SECRET;
    delete process.env.CRON_SECRET;
    process.env.NEXT_PUBLIC_SITE_URL = "https://duzceradikal.com";
  });

  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllGlobals();
  });

  it("uses explicit INDEXNOW_KEY", () => {
    process.env.INDEXNOW_KEY = "abc123";
    expect(getIndexNowKey()).toBe("abc123");
  });

  it("derives key from AUTH_SECRET when unset", () => {
    process.env.AUTH_SECRET = "test-secret-at-least-32-characters!";
    expect(getIndexNowKey()).toMatch(/^[a-f0-9]{32}$/);
  });

  it("builds keyLocation", () => {
    expect(getIndexNowKeyLocation("https://duzceradikal.com")).toBe(
      "https://duzceradikal.com/indexnow-key.txt",
    );
  });

  it("posts urlList to IndexNow", async () => {
    process.env.INDEXNOW_KEY = "fixed-key-32chars-xxxxxxxxxxxx".slice(0, 32);
    const fetchMock = vi.fn().mockResolvedValue({ status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const result = await submitUrlsToIndexNow([
      "https://duzceradikal.com/haber/ornek",
      "https://duzceradikal.com/haber/ornek",
    ]);

    expect(result.ok).toBe(true);
    expect(result.submitted).toBe(1);
    expect(fetchMock).toHaveBeenCalledOnce();
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.host).toBe("duzceradikal.com");
    expect(body.urlList).toEqual(["https://duzceradikal.com/haber/ornek"]);
  });
});
