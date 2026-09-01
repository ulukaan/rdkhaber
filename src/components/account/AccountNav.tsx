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

function NavLink({
  href,
  label,
  Icon,
  active,
  className,
}: {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  active: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-colors lg:w-full lg:min-h-0 lg:rounded-none",
        active
          ? "border-brand bg-brand text-white"
          : "border-border bg-white text-ink hover:border-brand hover:text-brand",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="whitespace-nowrap">{label}</span>
    </Link>
  );
}

export function AccountNav({ role, name }: { role: Role; name?: string | null }) {
  const pathname = usePathname();
  const staff = role === "ADMIN" || role === "EDITOR";

  return (
    <aside className="min-w-0 max-w-full lg:sticky lg:top-24 lg:self-start">
      <div className="mb-3 border border-border bg-white px-4 py-3">
        <p className="truncate text-sm font-extrabold text-ink">{name ?? "Üye"}</p>
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
          {roleLabel(role)}
        </p>
      </div>

      <div className="relative min-w-0 max-w-full lg:static">
        <nav
          className="account-nav-scroll flex min-w-0 max-w-full snap-x snap-mandatory gap-1.5 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-col lg:overflow-visible lg:snap-none"
          aria-label="Hesap menüsü"
        >
          {LINKS.map((item) => {
            const { href, label, Icon } = item;
            const active = item.exact
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <NavLink key={href} href={href} label={label} Icon={Icon} active={active} />
            );
          })}
          {staff ? (
            <>
              <NavLink
                href="/hesabim/guvenlik"
                label="Güvenlik (2FA)"
                Icon={Shield}
                active={pathname === "/hesabim/guvenlik"}
              />
              <NavLink
                href={panelPathForRole(role)}
                label={role === "ADMIN" ? "Yönetim paneli" : "Editör paneli"}
                Icon={LayoutDashboard}
                active={false}
                className="border-ink bg-ink text-white hover:border-ink hover:bg-ink/90 hover:text-white lg:mt-2"
              />
            </>
          ) : null}
        </nav>
        <span
          className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-surface to-transparent lg:hidden"
          aria-hidden
        />
      </div>
    </aside>
  );
}
