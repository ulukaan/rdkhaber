import { describe, expect, it, vi } from "vitest";
import { safeLoad } from "@/lib/safe-load";

describe("safeLoad", () => {
  it("başarılı sonucu döndürür", async () => {
    await expect(safeLoad("ok", async () => 42, 0)).resolves.toBe(42);
  });

  it("hata durumunda yedeği döndürür", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      safeLoad("fail", async () => {
        throw new Error("db down");
      }, []),
    ).resolves.toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
