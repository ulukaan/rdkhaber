import { ChartNoAxesCombined, Code2, LayoutGrid, ListTree, Palette } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { HubCard } from "@/components/admin/PanelUI";

export const metadata = { title: "Görünüm" };

const SECTIONS = [
  {
    href: "/admin/gorunum/menu",
    title: "Menü",
    description: "Üst menü ve alt bilgi bağlantılarını düzenleyin, sırasını değiştirin.",
    Icon: ListTree,
  },
  {
    href: "/admin/gorunum/ogeler",
    title: "Ana Sayfa Öğeleri",
    description: "Manşet, gündem bandı, foto galeri gibi blokları açıp kapatın.",
    Icon: LayoutGrid,
  },
  {
    href: "/admin/gorunum/tema",
    title: "Tema Ayarları",
    description: "Site adı, logo ve marka rengi gibi görsel kimlik ayarları.",
    Icon: Palette,
  },
  {
    href: "/admin/gorunum/google",
    title: "Google Site Kit",
    description: "Analytics, Tag Manager, Search Console ve AdSense reklam ayarları.",
    Icon: ChartNoAxesCombined,
  },
  {
    href: "/admin/gorunum/ozel-kod",
    title: "Özel Kod Alanları",
    description: "Analitik, doğrulama etiketi veya özel CSS eklemek için kod alanları.",
    Icon: Code2,
  },
];

export default function AppearanceIndexPage() {
  return (
    <>
      <PageHeader
        title="Görünüm"
        description="Sitenin menüsü, ana sayfa blokları ve görsel kimliği bu bölümden yönetilir."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SECTIONS.map((section) => (
          <HubCard key={section.href} {...section} />
        ))}
      </div>
    </>
  );
}
