import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/PageHeader";

export const metadata = { title: "BİK / Resmî ilan" };

export default async function BikPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHeader
        title="Basın İlan Kurumu (BİK)"
        description="Resmî ilan alıyorsanız BİK yükümlülüklerini buradan takip edin."
      />
      <div className="max-w-2xl space-y-4 rounded-xl border border-border bg-white p-5 text-sm text-ink-soft shadow-sm">
        <p>
          Resmî ilan yayınlamıyorsanız ek entegrasyon gerekmez. İlan almaya başladığınızda BİK
          sistemine kayıt, aylık trafik raporu ve ilan arşivi zorunludur.
        </p>
        <p>
          Yayıncı kodu:{" "}
          <strong className="text-ink">
            {settings.bikPublisherCode?.trim() || "Tanımlı değil — Site Ayarlarından ekleyin"}
          </strong>
        </p>
        <p>
          Detay:{" "}
          <a
            href="https://www.bik.gov.tr"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand hover:underline"
          >
            bik.gov.tr
          </a>
        </p>
      </div>
    </>
  );
}
