"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, LogOut, MessageCircle, User, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { SearchForm } from "@/components/layout/SearchForm";
import { MobileMenuPanels } from "@/components/layout/MobileMenuPanels";
import { TarifParkLink } from "@/components/layout/TarifParkLink";
import { cn, whatsappUrl } from "@/lib/utils";
import type { SiteMenuCategory, SiteMenuLink } from "@/lib/site-menu-sections";
import { signOutAction } from "@/actions/auth";
import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/icons/SocialIcons";

type AccountInfo =
  | { authenticated: true; name: string; accountHref: string; panelHref?: string }
  | { authenticated: false };

type SocialLink = { href: string; label: string };

function MenuToggleIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-5 w-[22px] flex-col items-center justify-center" aria-hidden>
      <span
        className={cn(
          "absolute block h-[2.5px] w-[22px] bg-current transition-all duration-300 ease-out motion-reduce:transition-none",
          open ? "rotate-45" : "-translate-y-[6px]",
        )}
      />
      <span
        className={cn(
          "absolute block h-[2.5px] w-[22px] bg-current transition-all duration-300 ease-out motion-reduce:transition-none",
          open ? "scale-x-0 opacity-0" : "opacity-100",
        )}
      />
      <span
        className={cn(
          "absolute block h-[2.5px] w-[22px] bg-current transition-all duration-300 ease-out motion-reduce:transition-none",
          open ? "-rotate-45" : "translate-y-[6px]",
        )}
      />
    </span>
  );
}

function socialIcon(label: string) {
  if (label === "Facebook") return <FacebookIcon className="h-4 w-4" />;
  if (label === "Instagram") return <InstagramIcon className="h-4 w-4" />;
  if (label === "YouTube") return <YoutubeIcon className="h-4 w-4" />;
  return <XIcon className="h-4 w-4" />;
}

export function MobileMenu({
  siteName,
  logoUrl,
  categories,
  whatsappNumber,
  account,
  socials = [],
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

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
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
        className={cn(
          "fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        id="site-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menüsü"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(100%,20.5rem)] flex-col bg-card shadow-[-8px_0_32px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-out motion-reduce:transition-none",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="min-w-0">
            <Logo siteName={siteName} logoUrl={logoUrl} />
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Menüyü kapat"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink transition-colors active:bg-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="shrink-0 px-4 py-3">
          <SearchForm
            className="h-11 rounded-xl border-border/80 bg-surface/80 py-2 text-sm"
            placeholder="Sitede ara..."
          />
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <MobileMenuPanels
            categories={categories}
            services={services}
            corporate={corporate}
            onNavigate={close}
          />
        </nav>

        <footer className="shrink-0 border-t border-border/70 bg-surface/40 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {(socials.length > 0 || whatsappNumber) && (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors active:bg-white/80"
                >
                  {socialIcon(s.label)}
                </a>
              ))}
              {whatsappNumber ? (
                <a
                  href={whatsappUrl(whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  aria-label="WhatsApp ile iletişim"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold text-emerald-700 transition-colors active:bg-white/80"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  WhatsApp
                </a>
              ) : null}
              <div className="ml-auto">
                <TarifParkLink variant="nav" onClick={close} />
              </div>
            </div>
          )}

          {account.authenticated ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link
                  href={account.accountHref}
                  onClick={close}
                  className="flex min-h-[44px] flex-1 items-center gap-2.5 rounded-xl bg-card px-3 text-sm font-semibold text-ink shadow-sm ring-1 ring-border/60"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink-soft">
                    <User className="h-4 w-4" />
                  </span>
                  {account.name}
                </Link>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    aria-label="Çıkış yap"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-card text-ink-soft shadow-sm ring-1 ring-border/60 transition-colors active:bg-surface"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              </div>
              {account.panelHref ? (
                <Link
                  href={account.panelHref}
                  onClick={close}
                  className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold text-ink transition-colors active:bg-card"
                >
                  <LayoutDashboard className="h-4 w-4 text-ink-soft" />
                  Yönetim Paneli
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/giris"
                onClick={close}
                className="flex min-h-[44px] items-center justify-center rounded-xl bg-brand px-3 text-sm font-semibold text-white transition-transform active:scale-[0.98] motion-reduce:transform-none"
              >
                Giriş Yap
              </Link>
              <Link
                href="/kayit"
                onClick={close}
                className="flex min-h-[44px] items-center justify-center rounded-xl bg-card px-3 text-sm font-semibold text-ink shadow-sm ring-1 ring-border/60 transition-transform active:scale-[0.98] motion-reduce:transform-none"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
