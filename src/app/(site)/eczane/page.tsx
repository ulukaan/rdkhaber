import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { StaticPageHeader } from "@/components/pages/StaticDocument";
import { PharmacyWidget } from "@/components/services/PharmacyWidget";
import { DUZCE_DISTRICTS, getDutyPharmacies } from "@/lib/pharmacy";

export const metadata: Metadata = {
  title: "Nöbetçi Eczaneler",
  description: "Düzce ve ilçelerde bugün nöbetçi olan eczaneler — adres ve telefon.",
};

export default async function PharmacyPage({
  searchParams,
}: {
  searchParams: Promise<{ ilce?: string }>;
}) {
  const { ilce } = await searchParams;
  const initialDistrict = ilce?.trim().toLowerCase() || "merkez";
  const districtDef = DUZCE_DISTRICTS.find((d) => d.slug === initialDistrict);
  const apiPharmacies = await getDutyPharmacies(
    "Düzce",
    districtDef && districtDef.slug !== "merkez" ? districtDef.name : undefined,
  );

  return (
    <>
      <StaticPageHeader
        title="Nöbetçi Eczaneler"
        eyebrow="Servis"
        description="Düzce ve ilçelerde bugün nöbetçi eczaneleri görüntüleyin. Gitmeden önce telefonla teyit etmenizi öneririz."
      />
      <Container className="pb-10 pt-2">
        <PharmacyWidget initialDistrict={initialDistrict} apiPharmacies={apiPharmacies} />
      </Container>
    </>
  );
}
