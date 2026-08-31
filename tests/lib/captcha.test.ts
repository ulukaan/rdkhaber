import { describe, expect, it, afterEach } from "vitest";
import { captchaConfigured, turnstileSiteKey, verifyTurnstileToken } from "@/lib/captcha";

describe("captcha helpers", () => {
  const prevSite = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const prevSecret = process.env.TURNSTILE_SECRET_KEY;

  afterEach(() => {
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = prevSite;
    process.env.TURNSTILE_SECRET_KEY = prevSecret;
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

  it("anahtar yokken doğrulama atlanır", async () => {
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;
    await expect(verifyTurnstileToken("")).resolves.toBe(true);
  });
});
