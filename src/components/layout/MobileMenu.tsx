"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  ChevronRight,
  CircleHelp,
  HeartPulse,
  Home,
  Landmark,
  LayoutDashboard,
  LogIn,
  LogOut,
  Map as MapIcon,
  MapPinned,
  Megaphone,
  Moon,
  Newspaper,
  Search,
  Sparkles,
  Sun,
  TrendingUp,
  Trophy,
  UserRound,
  Users,
  Vote,
  Wrench,
  X,
} from "lucide-react";
import { categoryHref } from "@/lib/category-path";
import { partyColor, partyLogoUrl } from "@/lib/party-logos";
import {
  buildSiteMenuSections,
  CORPORATE_LINKS,
  SERVICE_LINKS,
  type SiteMenuCategory,
  type SiteMenuLink,
} from "@/lib/site-menu-sections";
import { useTheme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/actions/auth";

type AccountInfo =
  | { authenticated: true; name: string; accountHref: string; panelHref?: string }
  | { authenticated: false };

type SocialLink = { href: string; label: string };

const ICON = { size: 20, stroke: 1.6 } as const;

const NEWS_ICONS: Record<string, typeof Home> = {
  gundem: Newspaper,
  siyaset: Landmark,
  ekonomi: TrendingUp,
  spor: Trophy,
  saglik: HeartPulse,
  magazin: Sparkles,
  turkiye: MapPinned,
  bolge: MapIcon,
};

function MenuToggleIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-5 w-5 flex-col items-center justify-center" aria-hidden>
      <span
        className={cn(
          "absolute h-[1.5px] w-[18px] rounded-full bg-current transition-all duration-200 ease-out motion-reduce:transition-none",
          open ? "rotate-45" : "-translate-y-[5px]",
        )}
      />
      <span
        className={cn(
          "absolute h-[1.5px] w-[18px] rounded-full bg-current transition-all duration-200 ease-out motion-reduce:transition-none",
          open ? "opacity-0" : "opacity-100",
        )}
      />
      <span
        className={cn(
          "absolute h-[1.5px] w-[18px] rounded-full bg-current transition-all duration-200 ease-out motion-reduce:transition-none",
          open ? "-rotate-45" : "translate-y-[5px]",
        )}
      />
    </span>
  );
}

function ThemeSegment() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="px-5 pb-4">
      <p className="mb-2 text-[12px] font-medium text-ink-soft">Tema</p>
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-surface p-1">
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={cn(
            "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200",
            theme === "light"
              ? "bg-card text-ink shadow-sm"
              : "text-ink-soft active:bg-card/50",
          )}
          aria-pressed={theme === "light"}
        >
          <Sun className="h-4 w-4" strokeWidth={ICON.stroke} aria-hidden />
          Açık
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-200",
            theme === "dark"
              ? "bg-card text-ink shadow-sm"
              : "text-ink-soft active:bg-card/50",
          )}
          aria-pressed={theme === "dark"}
        >
          <Moon className="h-4 w-4" strokeWidth={ICON.stroke} aria-hidden />
          Koyu
        </button>
      </div>
    </div>
  );
}

function IconRow({
  href,
  icon: Icon,
  children,
  onClick,
}: {
  href: string;
  icon: typeof Home;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex min-h-12 items-center gap-3.5 px-5 text-[15px] font-medium text-ink transition-colors active:bg-surface/80"
    >
      <Icon className="h-5 w-5 shrink-0 text-ink" strokeWidth={ICON.stroke} aria-hidden />
      <span className="min-w-0 truncate">{children}</span>
    </Link>
  );
}

function GroupRow({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Home;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full min-h-12 items-center gap-3.5 px-5 text-left transition-colors active:bg-surface/80"
      >
        <Icon className="h-5 w-5 shrink-0 text-ink" strokeWidth={ICON.stroke} aria-hidden />
        <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-ink">{title}</span>
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-ink-soft transition-transform duration-200 ease-out motion-reduce:transition-none",
            open && "rotate-90",
          )}
          strokeWidth={ICON.stroke}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-1 pl-12 pr-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

function SubLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex min-h-10 items-center rounded-xl px-2 text-[14px] font-medium text-ink-soft transition-colors active:bg-surface active:text-ink"
    >
      {children}
    </Link>
  );
}

function PartyLink({ cat, onClick }: { cat: SiteMenuCategory; onClick: () => void }) {
  const color = partyColor(cat.slug) || "#d0021b";
  const logo = partyLogoUrl(cat.slug);

  return (
    <Link
      href={categoryHref(cat.slug)}
      onClick={onClick}
      className="flex min-h-10 items-center gap-2 rounded-xl px-2 text-[14px] font-medium text-ink-soft transition-colors active:bg-surface active:text-ink"
    >
      {logo ? (
        <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-md bg-card ring-1 ring-border/70">
          <Image src={logo} alt="" fill className="object-contain p-0.5" sizes="20px" unoptimized />
        </span>
      ) : (
        <span className="h-4 w-1 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      )}
      <span className="min-w-0 truncate">{cat.name}</span>
    </Link>
  );
}

function mergeLinks(primary: SiteMenuLink[] | undefined, fallback: SiteMenuLink[]) {
  const byHref = new Map<string, SiteMenuLink>();
  for (const link of fallback) byHref.set(link.href, link);
  for (const link of primary ?? []) byHref.set(link.href, link);
  return [...byHref.values()].sort((a, b) => {
    const aExt = /^https?:\/\//i.test(a.href) ? 1 : 0;
    const bExt = /^https?:\/\//i.test(b.href) ? 1 : 0;
    return aExt - bExt;
  });
}

function Avatar({ name }: { name?: string }) {
  const initial = (name?.trim()?.[0] ?? "M").toLocaleUpperCase("tr-TR");
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-bold text-ink ring-1 ring-border/60">
      {initial}
    </span>
  );
}

export function MobileMenu({
  siteName,
  categories,
  account,
  services,
  corporate,
}: {
  siteName: string;
  logoUrl?: string;
  categories: SiteMenuCategory[];
  whatsappNumber: string;
  account: AccountInfo;
  socials?: SocialLink[];
  services?: SiteMenuLink[];
  corporate?: SiteMenuLink[];
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const sections = buildSiteMenuSections(categories);
  const serviceLinks = mergeLinks(services, SERVICE_LINKS);
  const corporateLinks = mergeLinks(corporate, CORPORATE_LINKS);
  const displayName = account.authenticated ? account.name : "Misafir";

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("mobile-menu-open");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.body.classList.remove("mobile-menu-open");
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="site-mobile-menu"
        aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        className="relative z-[120] flex h-10 w-10 items-center justify-center text-white transition-colors active:bg-white/15 lg:text-ink lg:active:bg-surface"
      >
        <MenuToggleIcon open={open} />
      </button>

      <button
        type="button"
        onClick={close}
        aria-label="Menüyü kapat"
        tabIndex={open ? 0 : -1}
        className={cn(
          "fixed inset-0 z-[90] bg-black/40 transition-opacity duration-200 ease-out motion-reduce:transition-none",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        id="site-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={`${siteName} menü`}
        className={cn(
          "fixed bottom-3 right-3 top-3 z-[100] flex w-[min(calc(100vw-1.5rem),20.5rem)] flex-col overflow-hidden rounded-[1.75rem] bg-card shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition-all duration-200 ease-out motion-reduce:transition-none",
          open ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-4 opacity-0",
        )}
      >
        {/* Profil başlık */}
        <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={displayName} />
            <div className="min-w-0">
              <p className="text-[17px] font-semibold leading-tight text-ink">Merhaba,</p>
              <p className="truncate text-[13px] text-ink-soft">{displayName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Menüyü kapat"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink transition-colors active:bg-surface"
          >
            <X className="h-5 w-5" strokeWidth={ICON.stroke} />
          </button>
        </div>

        <ThemeSegment />

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <nav className="pb-2">
            <IconRow href="/" icon={Home} onClick={close}>
              Anasayfa
            </IconRow>
            {sections.news.map((c) => {
              const Icon = NEWS_ICONS[c.slug] ?? Newspaper;
              return (
                <IconRow key={c.slug} href={categoryHref(c.slug)} icon={Icon} onClick={close}>
                  {c.name}
                </IconRow>
              );
            })}

            {sections.districts.length > 0 ? (
              <GroupRow title="Bölge" icon={MapIcon}>
                <div className="grid grid-cols-2 gap-x-1">
                  {sections.districts.map((c) => (
                    <SubLink key={c.slug} href={categoryHref(c.slug)} onClick={close}>
                      {c.name}
                    </SubLink>
                  ))}
                </div>
              </GroupRow>
            ) : null}

            {sections.parties.length > 0 ? (
              <GroupRow title="Siyasi Partiler" icon={Vote}>
                {sections.parties.map((c) => (
                  <PartyLink key={c.slug} cat={c} onClick={close} />
                ))}
              </GroupRow>
            ) : null}

            <GroupRow title="Servisler" icon={Wrench}>
              {serviceLinks.map((link) => (
                <SubLink key={link.href} href={link.href} onClick={close}>
                  {link.label}
                </SubLink>
              ))}
            </GroupRow>

            <GroupRow title="Kurumsal" icon={Building2}>
              {corporateLinks.map((link) => (
                <SubLink key={link.href} href={link.href} onClick={close}>
                  {link.label}
                </SubLink>
              ))}
            </GroupRow>

            <IconRow href="/arama" icon={Search} onClick={close}>
              Ara
            </IconRow>
            <IconRow href="/ihbar-hatti" icon={Megaphone} onClick={close}>
              İhbar Hattı
            </IconRow>
            {account.authenticated ? (
              <>
                <IconRow href={account.accountHref} icon={UserRound} onClick={close}>
                  Hesabım
                </IconRow>
                {account.panelHref ? (
                  <IconRow href={account.panelHref} icon={LayoutDashboard} onClick={close}>
                    Yönetim Paneli
                  </IconRow>
                ) : null}
              </>
            ) : null}
            <IconRow href="/sayfa/kunye" icon={CircleHelp} onClick={close}>
              Yardım
            </IconRow>
          </nav>

          <div className="mt-2 border-t border-border/70 pt-2">
            {account.authenticated ? (
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full min-h-12 items-center gap-3.5 px-5 text-[15px] font-medium text-ink transition-colors active:bg-surface/80"
                >
                  <LogOut className="h-5 w-5 shrink-0" strokeWidth={ICON.stroke} aria-hidden />
                  Çıkış Yap
                </button>
              </form>
            ) : (
              <>
                <IconRow href="/giris" icon={LogIn} onClick={close}>
                  Giriş Yap
                </IconRow>
                <IconRow href="/kayit" icon={Users} onClick={close}>
                  Kayıt Ol
                </IconRow>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

