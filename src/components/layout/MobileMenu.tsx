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
          "absolute block h-[2px] w-[20px] rounded-full bg-current transition-all duration-[250ms] ease-out motion-reduce:transition-none",
          open ? "rotate-45" : "-translate-y-[5px]",
        )}
      />
      <span
        className={cn(
          "absolute block h-[2px] w-[20px] rounded-full bg-current transition-all duration-[250ms] ease-out motion-reduce:transition-none",
          open ? "scale-x-0 opacity-0" : "opacity-100",
        )}
      />
      <span
        className={cn(
          "absolute block h-[2px] w-[20px] rounded-full bg-current transition-all duration-[250ms] ease-out motion-reduce:transition-none",
          open ? "-rotate-45" : "translate-y-[5px]",
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
          "fixed inset-0 z-[70] bg-ink/35 transition-opacity duration-[250ms] ease-out motion-reduce:transition-none",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        id="site-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menüsü"
        className={cn(
          "fixed inset-y-0 right-0 z-[80] flex w-[min(86vw,19.5rem)] max-w-full flex-col bg-white shadow-[-12px_0_28px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          open ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
      >
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3.5 py-2.5 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <div className="min-w-0 scale-[0.92] origin-left">
            <Logo siteName={siteName} logoUrl={logoUrl} />
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Menüyü kapat"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors active:bg-surface active:text-ink"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          <div className="shrink-0 px-3.5 pb-2 pt-3">
            <SearchForm
              className="h-10 rounded-lg border-border/70 bg-surface/70 py-2 text-sm"
              placeholder="Sitede ara..."
            />
          </div>

          <nav className="shrink-0">
            <MobileMenuPanels
              categories={categories}
              services={services}
              corporate={corporate}
              onNavigate={close}
            />
          </nav>

          {(socials.length > 0 || whatsappNumber) && (
            <div className="mx-3.5 mt-2 flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors active:bg-surface active:text-ink"
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
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-emerald-700 transition-colors active:bg-emerald-50"
                >
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                  WhatsApp
                </a>
              ) : null}
              <div className="ml-auto shrink-0 [&_a]:h-9 [&_a]:border-0 [&_a]:bg-transparent [&_a]:px-1.5">
                <TarifParkLink variant="nav" onClick={close} />
              </div>
            </div>
          )}

          <div className="mt-3 shrink-0 border-t border-border/50 px-3.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
            {account.authenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={account.accountHref}
                    onClick={close}
                    className="flex min-h-[42px] flex-1 items-center gap-2 rounded-lg bg-surface px-2.5 text-sm font-semibold text-ink"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-ink-soft ring-1 ring-border/60">
                      <User className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate">{account.name}</span>
                  </Link>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      aria-label="Çıkış yap"
                      className="flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-surface text-ink-soft transition-colors active:bg-border/40"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </form>
                </div>
                {account.panelHref ? (
                  <Link
                    href={account.panelHref}
                    onClick={close}
                    className="flex min-h-[42px] items-center justify-center gap-2 rounded-lg text-sm font-semibold text-ink-soft transition-colors active:bg-surface"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Yönetim Paneli
                  </Link>
                ) : null}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/giris"
                  onClick={close}
                  className="flex min-h-[42px] items-center justify-center rounded-lg bg-brand px-3 text-sm font-semibold text-white transition-opacity active:opacity-90"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/kayit"
                  onClick={close}
                  className="flex min-h-[42px] items-center justify-center rounded-lg border border-border bg-white px-3 text-sm font-semibold text-ink transition-colors active:bg-surface"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
