import { describe, expect, it, afterEach, vi } from "vitest";
import { captchaConfigured, turnstileSiteKey, verifyTurnstileToken } from "@/lib/captcha";

describe("captcha helpers", () => {
  const prevSite = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const prevSecret = process.env.TURNSTILE_SECRET_KEY;
  const prevNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = prevSite;
    process.env.TURNSTILE_SECRET_KEY = prevSecret;
    process.env.NODE_ENV = prevNodeEnv;
    vi.unstubAllEnvs();
  });

  it("site key boşsa yapılandırılmamış sayılır", () => {
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;
    expect(turnstileSiteKey()).toBe("");
    expect(captchaConfigured()).toBe(false);
  });

  it("her iki anahtar varsa yapılandırılmış sayılır", () => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "site-key";
    process.env.TURNSTILE_SECRET_KEY = "secret-key";
    expect(captchaConfigured()).toBe(true);
  });

  it("prod'da anahtar yokken doğrulama reddedilir", async () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;
    await expect(verifyTurnstileToken("")).resolves.toBe(false);
  });

  it("geliştirmede anahtar yokken doğrulama atlanır", async () => {
    vi.stubEnv("NODE_ENV", "development");
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;
    await expect(verifyTurnstileToken("")).resolves.toBe(true);
  });
});
