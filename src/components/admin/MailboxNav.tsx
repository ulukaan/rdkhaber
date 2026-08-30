import { PanelSubNav } from "@/components/admin/PanelUI";

const LINKS = [
  { href: "/admin/eposta", label: "Gelen", exact: true },
  { href: "/admin/eposta/giden", label: "Giden" },
  { href: "/admin/eposta/yeni", label: "Yeni e-posta" },
];

export function MailboxNav({ pathname }: { pathname: string }) {
  return <PanelSubNav pathname={pathname} links={LINKS} label="E-posta" />;
}
