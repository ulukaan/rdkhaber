"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, LogOut, User, X } from "lucide-react";
import { SearchForm } from "@/components/layout/SearchForm";
import { MobileMenuPanels } from "@/components/layout/MobileMenuPanels";
import { cn, whatsappUrl } from "@/lib/utils";
import type { SiteMenuCategory, SiteMenuLink } from "@/lib/site-menu-sections";
import { signOutAction } from "@/actions/auth";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsAppIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/icons/SocialIcons";

type AccountInfo =
  | { authenticated: true; name: string; accountHref: string; panelHref?: string }
  | { authenticated: false };

type SocialLink = { href: string; label: string };

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

function socialIcon(label: string) {
  if (label === "Facebook") return <FacebookIcon className="h-4 w-4" />;
  if (label === "Instagram") return <InstagramIcon className="h-4 w-4" />;
  if (label === "YouTube") return <YoutubeIcon className="h-4 w-4" />;
  return <XIcon className="h-4 w-4" />;
}

export function MobileMenu({
  siteName,
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
          "fixed inset-0 z-[90] bg-black/45 transition-opacity duration-200 ease-out motion-reduce:transition-none",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        id="site-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={`${siteName} menü`}
        className={cn(
          "fixed inset-y-0 right-0 z-[100] flex w-[min(88vw,21rem)] flex-col bg-white shadow-[-8px_0_24px_rgba(0,0,0,0.14)] transition-transform duration-200 ease-out motion-reduce:transition-none",
          open ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
      >
        <div className="shrink-0 border-b border-border px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[15px] font-bold text-ink">Menü</p>
            <button
              type="button"
              onClick={close}
              aria-label="Menüyü kapat"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink-soft transition-colors active:bg-border/60 active:text-ink"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
          </div>
          <SearchForm
            className="h-10 rounded-xl border-transparent bg-surface py-2 text-sm shadow-none focus-within:border-brand/25 focus-within:bg-white focus-within:ring-1 focus-within:ring-brand/15"
            placeholder="Ara..."
          />
        </div>

        {/* Tek kaydırma alanı — içerik üstte peş peşe, ortada boşluk yok */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <nav className="px-2 py-1.5">
            <MobileMenuPanels
              categories={categories}
              services={services}
              corporate={corporate}
              onNavigate={close}
            />
          </nav>

          <div className="border-t border-border px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-3">
            {(socials.length > 0 || whatsappNumber) && (
              <div className="mb-3 flex items-center gap-0.5">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors active:bg-surface active:text-ink"
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
                    aria-label="WhatsApp"
                    className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-[#25D366] transition-colors active:bg-emerald-50"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            )}

            {account.authenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={account.accountHref}
                    onClick={close}
                    className="flex min-h-11 flex-1 items-center gap-2.5 rounded-xl bg-surface px-3 text-sm font-semibold text-ink"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-ink-soft">
                      <User className="h-3.5 w-3.5" />
                    </span>
                    <span className="truncate">{account.name}</span>
                  </Link>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      aria-label="Çıkış yap"
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-ink-soft transition-colors active:bg-border/40"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </form>
                </div>
                {account.panelHref ? (
                  <Link
                    href={account.panelHref}
                    onClick={close}
                    className="flex min-h-10 items-center justify-center gap-2 rounded-xl text-sm font-medium text-ink-soft transition-colors active:bg-surface"
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
                  className="flex min-h-11 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white transition-opacity active:opacity-90"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/kayit"
                  onClick={close}
                  className="flex min-h-11 items-center justify-center rounded-xl border border-border bg-white text-sm font-semibold text-ink transition-colors active:bg-surface"
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
