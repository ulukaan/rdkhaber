import { test, expect } from "@playwright/test";

test("ana sayfa yüklenir", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator("body")).toBeVisible();
});

test("giriş sayfası erişilebilir", async ({ page }) => {
  const response = await page.goto("/giris");
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
