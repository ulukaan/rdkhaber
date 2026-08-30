import { PageHeader } from "@/components/admin/PageHeader";
import { AdForm } from "@/components/admin/AdForm";
import { getAdSlotDef } from "@/lib/ad-slots";

export const metadata = { title: "Yeni Reklam" };

export default async function NewAdPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const def = code ? getAdSlotDef(code) : undefined;

  return (
    <>
      <PageHeader title={def ? `${def.name} (#${def.code})` : "Yeni Reklam"} />
      <AdForm defaults={def ? { position: def.code, name: def.name } : undefined} />
    </>
  );
}
