"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, LogOut, MessageCircle, User, X } from "lucide-react";
import { SearchForm } from "@/components/layout/SearchForm";
import { SiteMenuPanels } from "@/components/layout/SiteMenuPanels";
import { cn, whatsappUrl } from "@/lib/utils";
import type { SiteMenuCategory, SiteMenuLink } from "@/lib/site-menu-sections";
import { signOutAction } from "@/actions/auth";
import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/icons/SocialIcons";
import { TarifParkLink } from "@/components/layout/TarifParkLink";

type AccountInfo =
  | { authenticated: true; name: string; accountHref: string; panelHref?: string }
  | { authenticated: false };

type SocialLink = { href: string; label: string };

function MenuToggleIcon({ open }: { open: boolean }) {
  return (
    <span className="relative flex h-5 w-[22px] flex-col items-center justify-center" aria-hidden>
      <span
        className={cn(
          "absolute block h-[2.5px] w-[22px] rounded-full bg-current transition-all duration-300 ease-out",
          open ? "rotate-45" : "-translate-y-[6px]",
        )}
      />
      <span
        className={cn(
          "absolute block h-[2.5px] w-[22px] rounded-full bg-current transition-all duration-300 ease-out",
          open ? "scale-x-0 opacity-0" : "opacity-100",
        )}
      />
      <span
        className={cn(
          "absolute block h-[2.5px] w-[22px] rounded-full bg-current transition-all duration-300 ease-out",
          open ? "-rotate-45" : "translate-y-[6px]",
        )}
      />
    </span>
  );
}

function socialIcon(label: string) {
  if (label === "Facebook") return <FacebookIcon className="h-3.5 w-3.5" />;
  if (label === "Instagram") return <InstagramIcon className="h-3.5 w-3.5" />;
  if (label === "YouTube") return <YoutubeIcon className="h-3.5 w-3.5" />;
  return <XIcon className="h-3.5 w-3.5" />;
}

export function MobileMenu({
  categories,
  whatsappNumber,
  account,
  socials = [],
  services,
  corporate,
}: {
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
        aria-label={open ? "Menüyü kapat" : "Tüm menüyü aç"}
        className="relative z-[120] flex h-10 w-10 items-center justify-center rounded-md text-ink active:bg-surface"
      >
        <MenuToggleIcon open={open} />
      </button>

      <button
        type="button"
        onClick={close}
        aria-label="Menüyü kapat"
        className={cn(
          "fixed inset-0 z-50 bg-ink/35 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        id="site-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menüsü"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(100%,22rem)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out",
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

        <div className="shrink-0 border-b border-border px-3 py-2.5">
          <SearchForm className="h-10 rounded-md border-border py-1.5 text-sm" placeholder="Sitede ara..." />
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <SiteMenuPanels
            categories={categories}
            services={services}
            corporate={corporate}
            onNavigate={close}
            stacked
          />
        </nav>

        <div className="shrink-0 border-t border-brand/15 bg-brand/[0.04] px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white text-ink"
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
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-white px-2.5 text-xs font-semibold text-ink"
              >
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                WhatsApp
              </a>
            ) : null}
            <div className="ml-auto">
              <TarifParkLink variant="nav" onClick={close} />
            </div>
          </div>
        </div>

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
