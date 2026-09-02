"use server";

import { DUZCE_DISTRICTS, getDutyPharmacies } from "@/lib/pharmacy";

export async function loadDutyPharmaciesAction(districtSlug: string) {
  const district = DUZCE_DISTRICTS.find((d) => d.slug === districtSlug);
  if (!district) return { error: "Geçersiz ilçe." };

  const items = await getDutyPharmacies(
    "Düzce",
    district.slug === "merkez" ? undefined : district.name,
  );

  if (items.length === 0) {
    return {
      error: `${district.name} için nöbetçi eczane bulunamadı. Tam liste için eczane sayfasını açın.`,
      items: [] as Awaited<ReturnType<typeof getDutyPharmacies>>,
    };
  }

  return { items };
}
