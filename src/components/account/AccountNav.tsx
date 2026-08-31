"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import {
  Bell,
  Shield,
  Bookmark,
  BookOpen,
  LayoutDashboard,
  Mail,
  Megaphone,
  MessageSquare,
  Newspaper,
  Send,
  UserPlus,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { panelPathForRole, roleLabel } from "@/lib/role";

type AccountLink = {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  exact?: boolean;
};

const LINKS: AccountLink[] = [
  { href: "/hesabim", label: "Özet", Icon: LayoutDashboard, exact: true },
  { href: "/hesabim/kaydettiklerim", label: "Kaydettiklerim", Icon: Bookmark },
  { href: "/hesabim/okuduklarim", label: "Okuduklarım", Icon: BookOpen },
  { href: "/hesabim/takip", label: "Takip ettiklerim", Icon: UserPlus },
  { href: "/hesabim/haberlerim", label: "Haberlerim", Icon: Newspaper },
  { href: "/hesabim/yorumlarim", label: "Yorumlarım", Icon: MessageSquare },
  { href: "/hesabim/profil", label: "Profil", Icon: UserRound },
  { href: "/hesabim/bildirimler", label: "Bildirimler", Icon: Bell },
  { href: "/hesabim/verilerim", label: "Verilerim (KVKK)", Icon: Shield },
  { href: "/hesabim/haber-gonder", label: "Haber gönder", Icon: Send },
  { href: "/hesabim/ihbar", label: "İhbar hattı", Icon: Megaphone },
  { href: "/hesabim/bulten", label: "Bülten", Icon: Mail },
];

export function AccountNav({ role, name }: { role: Role; name?: string | null }) {
  const pathname = usePathname();
  const staff = role === "ADMIN" || role === "EDITOR";

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="mb-3 border border-border bg-white px-4 py-3">
        <p className="truncate text-sm font-extrabold text-ink">{name ?? "Üye"}</p>
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
          {roleLabel(role)}
        </p>
      </div>
      <nav
        className="-mx-3 flex gap-1 overflow-x-auto px-3 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
        aria-label="Hesap menüsü"
      >
        {LINKS.map((item) => {
          const { href, label, Icon } = item;
          const active = item.exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 border px-3 py-2 text-xs font-bold transition-colors lg:w-full",
                active
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-white text-ink hover:border-brand hover:text-brand",
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </Link>
          );
        })}
        {staff ? (
          <Link
            href={panelPathForRole(role)}
            className="inline-flex shrink-0 items-center gap-2 border border-ink bg-ink px-3 py-2 text-xs font-bold text-white hover:bg-ink/90 lg:mt-2 lg:w-full"
          >
            <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
            {role === "ADMIN" ? "Yönetim paneli" : "Editör paneli"}
          </Link>
        ) : null}
      </nav>
    </aside>
  );
}
