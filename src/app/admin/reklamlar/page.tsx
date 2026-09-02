import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/PageHeader";
import { AdSlotToggle } from "@/components/admin/AdSlotToggle";
import { PanelCard, SectionHeader } from "@/components/admin/PanelUI";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AD_GROUPS, formatSlotSize, normalizeSlotCode } from "@/lib/ad-slots";

export const metadata = { title: "Reklam Grupları" };

export default async function AdsPage() {
  const ads = await prisma.adSlot.findMany();
  const byCode = new Map(
    ads.map((ad) => [normalizeSlotCode(ad.position), ad] as const),
  );

  return (
    <>
      <PageHeader
        title="Reklam Grupları"
        description="Slot kodları, masaüstü/mobil ölçüler ve yayın durumu."
        action={
          <Button href="/admin/reklamlar/yeni" size="sm">
            Yeni Reklam
          </Button>
        }
      />

      <p className="mb-6 text-sm text-ink-soft">
        Ölçü yönergesi için{" "}
        <a href="#olculer" className="font-semibold text-brand hover:underline">
          tıklayınız
        </a>
        .
      </p>

      <div className="flex flex-col gap-8">
        {AD_GROUPS.map((group) => (
          <section key={group.id} id={group.id}>
            <SectionHeader title={group.title} />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {group.slots.map((slot) => {
                const ad = byCode.get(slot.code);
                const size = formatSlotSize(slot);
                return (
                  <PanelCard key={slot.code} className="transition hover:border-brand/40">
                    <Link
                      href={ad ? `/admin/reklamlar/${ad.id}` : `/admin/reklamlar/yeni?code=${slot.code}`}
                      className="block"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-ink">{slot.name}</h3>
                        <Badge variant={ad?.active ? "brand" : "outline"}>
                          {ad?.active ? "Dolu" : ad ? "Kapalı" : "Boş"}
                        </Badge>
                      </div>
                      {ad?.kind === "ADSENSE" ? (
                        <p className="mt-1 text-xs font-semibold text-emerald-700">Google AdSense</p>
                      ) : null}
                      {size && <p className="mt-2 text-xs text-ink-soft">{size}</p>}
                      {slot.note && <p className="mt-1 text-xs text-ink-soft">{slot.note}</p>}
                      <p className="mt-2 text-sm font-extrabold text-brand">#{slot.code}</p>
                    </Link>
                    {ad ? (
                      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                        <span className="text-xs text-ink-soft">Yayın</span>
                        <AdSlotToggle id={ad.id} active={ad.active} />
                      </div>
                    ) : null}
                  </PanelCard>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <PanelCard id="olculer" className="mt-10 bg-surface">
        <SectionHeader title="Ölçü yönergesi" className="mb-2" />
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">
          <li>D: masaüstü, M: mobil. Görseli belirtilen piksele mümkün olduğunca yakın yükleyin.</li>
          <li>Kule reklamlar yalnızca geniş ekranda (xl+) görünür.</li>
          <li>Açılış (modal) oturum başına bir kez gösterilir.</li>
          <li>Site altı fixed, sayfanın altına yapışır; görsel yoksa gizlenir.</li>
          <li>Boş slot sitede yer kaplamaz.</li>
          <li>
            Google AdSense için Reklam Grupları → slota girin → &quot;Google AdSense&quot; seçin →
            panelden kopyaladığınız kodu yapıştırın.
          </li>
        </ul>
      </PanelCard>
    </>
  );
}
