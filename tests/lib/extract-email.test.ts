import { describe, expect, it } from "vitest";
import { extractEmail, isValidEmail } from "@/lib/extract-email";

describe("extractEmail", () => {
  it("metinden e-posta çıkarır", () => {
    expect(extractEmail("Bana ulaşın: ali@ornek.com")).toBe("ali@ornek.com");
  });

  it("boş metinde null döner", () => {
    expect(extractEmail("")).toBeNull();
    expect(extractEmail(undefined)).toBeNull();
  });
});

describe("isValidEmail", () => {
  it("geçerli adresleri kabul eder", () => {
    expect(isValidEmail("test@example.org")).toBe(true);
  });

  it("geçersiz adresleri reddeder", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});
