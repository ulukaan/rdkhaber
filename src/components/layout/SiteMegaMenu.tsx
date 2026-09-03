"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { SearchForm } from "@/components/layout/SearchForm";
import { SiteMenuPanels } from "@/components/layout/SiteMenuPanels";
import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/icons/SocialIcons";
import { TarifParkLink } from "@/components/layout/TarifParkLink";
import type { SiteMenuCategory, SiteMenuLink } from "@/lib/site-menu-sections";
import { cn, whatsappUrl } from "@/lib/utils";

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

export function SiteMegaMenu({
  categories,
  socials,
  services,
  corporate,
  whatsappNumber,
}: {
  categories: SiteMenuCategory[];
  socials: SocialLink[];
  services?: SiteMenuLink[];
  corporate?: SiteMenuLink[];
  whatsappNumber?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [panelTop, setPanelTop] = useState(0);
  const close = () => setOpen(false);
  const toggle = () => setOpen((v) => !v);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => setMounted(true));
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    queueMicrotask(() => setVisible(false));
    const timer = window.setTimeout(() => setMounted(false), 300);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const header = document.querySelector("header.sticky");
    const update = () => {
      setPanelTop(header?.getBoundingClientRect().bottom ?? 0);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [mounted]);

  return (
    <div className="hidden md:block">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="site-mega-menu"
        aria-label={open ? "Menüyü kapat" : "Tüm menüyü aç"}
        className="relative z-[120] flex h-9 w-9 items-center justify-center border border-border bg-white text-ink transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <MenuToggleIcon open={open} />
      </button>

      {mounted ? (
        <>
          <button
            type="button"
            className={cn(
              "fixed inset-0 z-[100] cursor-default bg-ink/35 transition-opacity duration-300 ease-out",
              visible ? "opacity-100" : "opacity-0",
            )}
            aria-label="Menüyü kapat"
            onClick={close}
            style={{ top: panelTop }}
          />
          <div
            id="site-mega-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menüsü"
            aria-hidden={!visible}
            className={cn(
              "fixed inset-x-0 z-[110] flex max-h-[min(72vh,580px)] flex-col border-b border-border bg-white shadow-xl transition-all duration-300 ease-out",
              visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
            )}
            style={{ top: panelTop }}
          >
            <div className="shrink-0 border-b border-border bg-white">
              <div className="mx-auto flex max-w-[1100px] justify-center px-4 py-2.5 md:px-5">
                <SearchForm
                  className="h-9 w-full max-w-lg rounded-md border-border py-1.5 text-sm"
                  placeholder="Sitede ara..."
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <SiteMenuPanels
                categories={categories}
                services={services}
                corporate={corporate}
                onNavigate={close}
              />
            </div>

            <div className="shrink-0 border-t border-brand/15 bg-brand/[0.04]">
              <div className="mx-auto flex max-w-[1100px] items-center gap-3 px-4 py-2.5 md:px-5">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-white text-ink transition-colors hover:border-brand hover:text-brand"
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
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-white px-2.5 text-xs font-semibold text-ink hover:border-emerald-500 hover:text-emerald-700"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                      WhatsApp
                    </a>
                  ) : null}
                </div>
                <div className="ml-auto shrink-0">
                  <TarifParkLink variant="nav" onClick={close} />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
