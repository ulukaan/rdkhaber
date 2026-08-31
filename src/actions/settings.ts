"use server";

import { revalidatePath } from "next/cache";
import { settingsSchema } from "@/lib/validation";
import { setSettings } from "@/lib/settings";
import { requireRole } from "@/lib/auth-guard";
import { revalidatePublicSite } from "@/lib/revalidate-site";

export async function updateSettingsAction(raw: Record<string, unknown>) {
  await requireRole(["ADMIN"]);
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  await setSettings(parsed.data);
  revalidatePublicSite({ layout: true });
  revalidatePath("/admin/ayarlar");
  return { success: true };
}
