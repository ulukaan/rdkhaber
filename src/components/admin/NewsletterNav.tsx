import { PanelSubNav } from "@/components/admin/PanelUI";

const LINKS = [
  { href: "/admin/bulten", label: "Bültenler", exact: true },
  { href: "/admin/bulten/aboneler", label: "Aboneler" },
  { href: "/admin/bulten/yeni", label: "Yeni bülten" },
  { href: "/admin/bulten/ayarlar", label: "Ayarlar" },
];

export function NewsletterNav({ pathname }: { pathname: string }) {
  return <PanelSubNav pathname={pathname} links={LINKS} label="Bülten" />;
}
