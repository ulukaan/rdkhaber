import { ListTree } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { MenuEditor } from "@/components/admin/MenuEditor";
import { getNavItemsForEdit } from "@/lib/nav-menu";

export const metadata = { title: "Menü" };

export default async function MenuPage() {
  const [header, footer, services, corporate] = await Promise.all([
    getNavItemsForEdit("header"),
    getNavItemsForEdit("footer"),
    getNavItemsForEdit("footer_services"),
    getNavItemsForEdit("footer_corporate"),
  ]);

  return (
    <>
      <PageHeader
        title="Menü"
        description="Üst menü ve footer sütunları. Bağlantı ekleyip sırasını değiştirebilirsiniz."
      />
      <div className="space-y-8">
        <MenuEditor
          location="header"
          initial={header}
          title="Üst menü"
          description='Ana navigasyon. Alt sayfa eklemek için satırdaki köşe okunu veya "Alt sayfa ekle"yi kullanın.'
        />
        <MenuEditor
          location="footer"
          initial={footer}
          title="Footer — Kategoriler"
          description="Alt bilgideki Kategoriler sütunu."
        />
        <MenuEditor
          location="footer_services"
          initial={services}
          title="Footer — Servisler"
          description="Alt bilgideki Servisler sütunu (Yayın Akışı, Burçlar, TarifPark vb.)."
        />
        <MenuEditor
          location="footer_corporate"
          initial={corporate}
          title="Footer — Kurumsal"
          description="Alt bilgideki Kurumsal sütunu (İletişim, Künye, KVKK vb.)."
        />
      </div>
      <p className="mt-4 flex items-start gap-2 text-xs text-ink-soft">
        <ListTree className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Sitede üst menüde alt sayfalar fareyle üzerine gelince açılır.
      </p>
    </>
  );
}
