import type { Role } from "@prisma/client";
import {
  Archive,
  BadgeDollarSign,
  BarChart2,
  BookUser,
  Code2,
  FileText,
  FolderTree,
  ImageIcon,
  Images,
  LayoutDashboard,
  LayoutGrid,
  ListTree,
  Megaphone,
  MessageSquare,
  Newspaper,
  Palette,
  PanelsTopLeft,
  Send,
  Settings,
  Star,
  Tags,
  UserRound,
  Users,
  Tv,
  Video,
  Vote,
  Zap,
  Bot,
  Mail,
  Inbox,
  ChartNoAxesCombined,
  Shield,
  ScrollText,
  ClipboardCheck,
  Scale,
  type LucideIcon,
} from "lucide-react";
import { panelBrandLabel, panelPathForRole } from "@/lib/role";

export type PanelNavLink = {
  href: string;
  label: string;
  Icon: LucideIcon;
  /** Alt sayfaları olan bölüm girişleri yalnızca tam eşleşmede aktif sayılır. */
  exact?: boolean;
};

export type PanelNavGroup = {
  id: string;
  label: string;
  adminOnly?: boolean;
  items: PanelNavLink[];
};

export function getPanelHome(role: Role): PanelNavLink {
  return { href: panelPathForRole(role), label: "Genel Bakış", Icon: LayoutDashboard, exact: true };
}

export function getPanelNav(role: Role): PanelNavGroup[] {
  if (role === "USER") {
    return [
      {
        id: "hesap",
        label: "Hesabım",
        items: [
          { href: "/hesabim/profil", label: "Profil", Icon: UserRound },
          { href: "/hesabim/haberlerim", label: "Haberlerim", Icon: Newspaper },
          { href: "/hesabim/yorumlarim", label: "Yorumlarım", Icon: MessageSquare },
        ],
      },
      {
        id: "katki",
        label: "Katkı",
        items: [
          { href: "/hesabim/haber-gonder", label: "Haber Gönder", Icon: Send },
          { href: "/hesabim/ihbar", label: "İhbar Hattı", Icon: Megaphone },
          { href: "/hesabim/bulten", label: "E-posta bülteni", Icon: Mail },
        ],
      },
    ];
  }

  const base = role === "ADMIN" ? "/admin" : "/editor";

  const groups: PanelNavGroup[] = [
    {
      id: "haberler",
      label: "Haberler",
      items: [
        { href: `${base}/makaleler`, label: "Haberler", Icon: Newspaper },
        ...(role === "ADMIN"
          ? [{ href: "/admin/haber-botu", label: "Haber Botu", Icon: Bot }]
          : []),
        { href: `${base}/arsiv`, label: "Arşiv", Icon: Archive },
        ...(role === "ADMIN" ? [{ href: "/admin/manset", label: "Ana Manşetler", Icon: Star }] : []),
        { href: `${base}/son-dakika`, label: "Üst Manşetler", Icon: Zap },
        { href: `${base}/videolar`, label: "Videolar", Icon: Video },
      ],
    },
    {
      id: "okuyucu",
      label: "Okuyucu",
      items: [
        { href: `${base}/haber-basvurulari`, label: "Haber Gönderimleri", Icon: Send },
        { href: `${base}/ihbarlar`, label: "İhbar Hattı", Icon: Megaphone },
        { href: `${base}/yorumlar`, label: "Yorumlar", Icon: MessageSquare },
        ...(role === "ADMIN"
          ? [{ href: "/admin/anketler", label: "Anketler", Icon: BarChart2 }]
          : []),
      ],
    },
  ];

  if (role === "ADMIN") {
    groups.push(
      {
        id: "icerik",
        label: "İçerik",
        adminOnly: true,
        items: [
          { href: "/admin/kategoriler", label: "Kategoriler", Icon: FolderTree },
          { href: "/admin/etiketler", label: "Etiketler", Icon: Tags },
          { href: "/admin/sayfalar", label: "Sayfalar", Icon: FileText },
          { href: "/admin/galeriler", label: "Foto Galeri", Icon: Images },
          { href: "/admin/medya", label: "Medya", Icon: ImageIcon },
        ],
      },
      {
        id: "gorunum",
        label: "Görünüm",
        adminOnly: true,
        items: [
          { href: "/admin/gorunum", label: "Genel", Icon: PanelsTopLeft, exact: true },
          { href: "/admin/gorunum/menu", label: "Menü", Icon: ListTree },
          { href: "/admin/gorunum/ogeler", label: "Öğeler", Icon: LayoutGrid },
          { href: "/admin/gorunum/tema", label: "Tema Ayarları", Icon: Palette },
          { href: "/admin/gorunum/google", label: "Google Site Kit", Icon: ChartNoAxesCombined },
          { href: "/admin/gorunum/ozel-kod", label: "Özel Kod Alanları", Icon: Code2 },
        ],
      },
      {
        id: "yayin",
        label: "Yayın",
        adminOnly: true,
        items: [
          { href: "/admin/yayin-akisi", label: "Yayın Akışı", Icon: Tv },
          { href: "/admin/secim", label: "Seçim Merkezi", Icon: Vote },
          { href: "/admin/bulten", label: "Bülten", Icon: Mail },
          { href: "/admin/eposta", label: "E-posta", Icon: Inbox },
          { href: "/admin/reklamlar", label: "Reklam Grupları", Icon: BadgeDollarSign },
        ],
      },
      {
        id: "sistem",
        label: "Sistem",
        adminOnly: true,
        items: [
          { href: `${base}/onay-kuyrugu`, label: "Onay kuyruğu", Icon: ClipboardCheck },
          { href: "/admin/istatistikler", label: "İstatistikler", Icon: ChartNoAxesCombined },
          { href: "/admin/sikayetlar", label: "İçerik şikayetleri", Icon: Scale },
          { href: "/admin/bik", label: "BİK / Resmî ilan", Icon: FileText },
          { href: "/admin/audit-log", label: "Denetim kaydı", Icon: ScrollText },
          { href: "/admin/guvenlik", label: "Güvenlik (2FA)", Icon: Shield },
          { href: "/admin/kullanicilar", label: "Kullanıcılar", Icon: Users },
          { href: "/admin/ayarlar", label: "Ayarlar", Icon: Settings },
          { href: "/admin/kunye", label: "Künye", Icon: BookUser },
        ],
      },
    );
  }

  groups.push({
    id: "hesap",
    label: "Hesabım",
    items: [{ href: "/hesabim", label: "Sitede profilim", Icon: UserRound }],
  });

  return groups;
}

export function isNavActive(pathname: string, href: string, home: string, exact = false) {
  if (exact || href === home) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Aktif yolun hangi gruba/sayfaya karşılık geldiğini bulur; üst barda
 * "Haberler / Arşiv" biçiminde kırıntı göstermek için kullanılır.
 */
export function getPanelBreadcrumb(pathname: string, role: Role) {
  const home = panelPathForRole(role);
  const homeLink = getPanelHome(role);

  if (isNavActive(pathname, homeLink.href, home, true)) {
    return { group: "Panel", page: homeLink.label, Icon: homeLink.Icon };
  }

  const groups = getPanelNav(role);

  for (const group of groups) {
    for (const item of group.items) {
      if (isNavActive(pathname, item.href, home, item.exact)) {
        return { group: group.label, page: item.label, Icon: item.Icon };
      }
    }
  }

  return {
    group: panelBrandLabel(role),
    page: "Panel",
    Icon: LayoutDashboard,
  };
}
