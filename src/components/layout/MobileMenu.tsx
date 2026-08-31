"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  X,
  Home,
  LayoutDashboard,
  LogOut,
  Search,
  ChevronDown,
  User,
} from "lucide-react";
import { cn, whatsappUrl } from "@/lib/utils";
import { categoryHref } from "@/lib/category-path";
import { partyColor, partyLogoUrl } from "@/lib/party-logos";
import {
  buildSiteMenuSections,
  CORPORATE_LINKS,
  SERVICE_LINKS,
  type SiteMenuCategory,
} from "@/lib/site-menu-sections";
import { signOutAction } from "@/actions/auth";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/icons/SocialIcons";
import { TarifParkLink } from "@/components/layout/TarifParkLink";

type AccountInfo =
  | { authenticated: true; name: string; accountHref: string; panelHref?: string }
  | { authenticated: false };

type SocialLink = { href: string; label: string };

function DrawerLink({
  href,
  children,
  onClick,
  className,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex min-h-[44px] items-center rounded-lg px-3 text-sm font-semibold text-ink active:bg-surface",
        className,
      )}
    >
      {children}
    </Link>
  );
}

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/80 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-h-[44px] items-center justify-between px-3 py-2 text-left"
        aria-expanded={open}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-ink-soft transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? <div className="pb-2">{children}</div> : null}
    </div>
  );
}

function PartyLink({
  cat,
  onClick,
}: {
  cat: SiteMenuCategory;
  onClick: () => void;
}) {
  const color = partyColor(cat.slug) || "#d0021b";
  const logo = partyLogoUrl(cat.slug);

  return (
    <Link
      href={categoryHref(cat.slug)}
      onClick={onClick}
      className="flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 text-sm font-semibold text-ink active:bg-surface"
    >
      {logo ? (
        <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded border border-black/10 bg-white">
          <Image src={logo} alt="" fill className="object-contain p-0.5" sizes="28px" unoptimized />
        </span>
      ) : (
        <span
          className="h-7 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
      )}
      <span className="min-w-0 leading-snug">{cat.name}</span>
    </Link>
  );
}

export function MobileMenu({
  categories,
  whatsappNumber,
  account,
  socials = [],
}: {
  categories: SiteMenuCategory[];
  whatsappNumber: string;
  account: AccountInfo;
  socials?: SocialLink[];
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const sections = buildSiteMenuSections(categories);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const socialIcon = (label: string) => {
    if (label === "Facebook") return <FacebookIcon className="h-4 w-4" />;
    if (label === "Instagram") return <InstagramIcon className="h-4 w-4" />;
    if (label === "YouTube") return <YoutubeIcon className="h-4 w-4" />;
    return <XIcon className="h-4 w-4" />;
  };

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menüyü aç"
        className="flex h-10 w-10 items-center justify-center rounded-md text-ink active:bg-surface"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        onClick={close}
        aria-hidden
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site menüsü"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(100%,320px)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out pb-[env(safe-area-inset-bottom)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3 pt-[env(safe-area-inset-top)]">
          <span className="text-base font-black text-ink">Menü</span>
          <button
            type="button"
            onClick={close}
            aria-label="Menüyü kapat"
            className="flex h-10 w-10 items-center justify-center rounded-md text-ink active:bg-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          action="/arama"
          method="get"
          className="flex items-center gap-2 border-b border-border px-3 py-2.5"
        >
          <Search className="h-4 w-4 shrink-0 text-ink-soft" />
          <input
            type="search"
            name="q"
            enterKeyHint="search"
            placeholder="Haber ara..."
            className="w-full bg-transparent text-base outline-none placeholder:text-ink-soft"
          />
        </form>

        <nav className="flex-1 overflow-y-auto overscroll-contain">
          <DrawerLink href="/" onClick={close}>
            <Home className="mr-2.5 h-4 w-4 text-brand" />
            Anasayfa
          </DrawerLink>

          <CollapsibleSection title="Haberler" defaultOpen>
            {sections.news.map((c) => (
              <DrawerLink key={c.slug} href={categoryHref(c.slug)} onClick={close}>
                {c.name}
              </DrawerLink>
            ))}
          </CollapsibleSection>

          <CollapsibleSection title="Bölge">
            <div className="grid grid-cols-2 gap-x-1 px-1">
              {sections.districts.map((c) => (
                <DrawerLink key={c.slug} href={categoryHref(c.slug)} onClick={close}>
                  {c.name}
                </DrawerLink>
              ))}
            </div>
          </CollapsibleSection>

          {sections.parties.length > 0 ? (
            <CollapsibleSection title="Siyasi Partiler">
              {sections.parties.map((c) => (
                <PartyLink key={c.slug} cat={c} onClick={close} />
              ))}
            </CollapsibleSection>
          ) : null}

          <CollapsibleSection title="Servisler">
            {SERVICE_LINKS.map((link) => (
              <DrawerLink key={link.href} href={link.href} onClick={close}>
                {link.label}
              </DrawerLink>
            ))}
            <TarifParkLink variant="menu" onClick={close} />
          </CollapsibleSection>

          <CollapsibleSection title="Kurumsal">
            {CORPORATE_LINKS.map((link) => (
              <DrawerLink key={link.href} href={link.href} onClick={close}>
                {link.label}
              </DrawerLink>
            ))}
          </CollapsibleSection>

          {whatsappNumber ? (
            <a
              href={whatsappUrl(whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="mx-3 mb-2 mt-3 flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 text-sm font-bold text-white"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp Hattı
            </a>
          ) : null}

          {socials.length > 0 ? (
            <div className="flex flex-wrap gap-2 px-3 pb-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-ink"
                >
                  {socialIcon(s.label)}
                </a>
              ))}
            </div>
          ) : null}
        </nav>

        <div className="shrink-0 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {account.authenticated ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Link
                  href={account.accountHref}
                  onClick={close}
                  className="flex min-h-[44px] flex-1 items-center gap-2 rounded-lg bg-surface px-3 text-sm font-semibold text-ink"
                >
                  <User className="h-4 w-4" />
                  {account.name}
                </Link>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface text-ink-soft"
                    title="Çıkış Yap"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              </div>
              {account.panelHref ? (
                <Link
                  href={account.panelHref}
                  onClick={close}
                  className="flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold text-ink"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Panel
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/giris"
                onClick={close}
                className="flex min-h-[44px] items-center justify-center rounded-lg bg-brand px-3 text-sm font-bold text-white"
              >
                Giriş Yap
              </Link>
              <Link
                href="/kayit"
                onClick={close}
                className="flex min-h-[44px] items-center justify-center rounded-lg border border-border px-3 text-sm font-bold text-ink"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
