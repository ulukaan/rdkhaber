"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SearchForm } from "@/components/layout/SearchForm";
import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/icons/SocialIcons";
import { TarifParkLink } from "@/components/layout/TarifParkLink";
import { categoryHref } from "@/lib/category-path";
import { partyColor, partyLogoUrl } from "@/lib/party-logos";
import {
  buildSiteMenuSections,
  CORPORATE_LINKS,
  SERVICE_LINKS,
  type SiteMenuCategory,
} from "@/lib/site-menu-sections";
import { cn, whatsappUrl } from "@/lib/utils";

type CategoryLink = SiteMenuCategory;
type SocialLink = { href: string; label: string };

function Heading({ children }: { children: string }) {
  return (
    <h2 className="mb-2 border-b border-border pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-soft">
      {children}
    </h2>
  );
}

function NavItem({
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
      className="block rounded px-1.5 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface hover:text-brand"
    >
      {children}
    </Link>
  );
}

function PartyItem({ cat, onClick }: { cat: CategoryLink; onClick: () => void }) {
  const color = partyColor(cat.slug) || "#d0021b";
  const logo = partyLogoUrl(cat.slug);

  return (
    <Link
      href={categoryHref(cat.slug)}
      onClick={onClick}
      className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-[12px] font-semibold text-ink transition-colors hover:text-white"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {logo ? (
        <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded border border-black/10 bg-white">
          <Image src={logo} alt="" fill className="object-contain p-0.5" sizes="24px" unoptimized />
        </span>
      ) : (
        <span
          className="h-6 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
      )}
      <span className="min-w-0 leading-snug">{cat.name}</span>
    </Link>
  );
}

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

export function SiteMegaMenu({
  categories,
  socials,
  whatsappNumber,
}: {
  categories: CategoryLink[];
  socials: SocialLink[];
  services?: { label: string; href: string }[];
  corporate?: { label: string; href: string }[];
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
      setMounted(true);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
    const timer = window.setTimeout(() => setMounted(false), 300);
    return () => window.clearTimeout(timer);
  }, [open]);

  const menuSections = buildSiteMenuSections(categories);
  const newsCats = menuSections.news;
  const districtCats = menuSections.districts;
  const partyCats = menuSections.parties;

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

  // Panel, sticky header'ın (kur + son dakika dahil) hemen altından başlasın.
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

  const socialIcon = (label: string) => {
    if (label === "Facebook") return <FacebookIcon className="h-3.5 w-3.5" />;
    if (label === "Instagram") return <InstagramIcon className="h-3.5 w-3.5" />;
    if (label === "YouTube") return <YoutubeIcon className="h-3.5 w-3.5" />;
    return <XIcon className="h-3.5 w-3.5" />;
  };

  return (
    <div className="hidden md:block">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="site-mega-menu"
        aria-label={open ? "Menüyü kapat" : "Tüm menüyü aç"}
        className="relative z-[120] flex h-10 w-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
            {/* Sabit üst — kaydırınca kapanmaz */}
            <div className="shrink-0 border-b border-border bg-white">
              <div className="mx-auto flex max-w-[1100px] justify-center px-4 py-2.5 md:px-5">
                <SearchForm
                  className="h-9 w-full max-w-lg rounded-md border-border py-1.5 text-sm"
                  placeholder="Sitede ara..."
                />
              </div>
            </div>

            {/* Sadece içerik kayar */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto grid max-w-[1100px] gap-6 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 md:px-5">
                <section>
                  <Heading>Haberler</Heading>
                  <ul>
                    <li>
                      <NavItem href="/" onClick={close}>
                        Anasayfa
                      </NavItem>
                    </li>
                    {newsCats.map((c) => (
                      <li key={c.slug}>
                        <NavItem href={categoryHref(c.slug)} onClick={close}>
                          {c.name}
                        </NavItem>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <Heading>Bölge</Heading>
                  <ul className="grid grid-cols-2 gap-x-2">
                    {districtCats.map((c) => (
                      <li key={c.slug}>
                        <NavItem href={categoryHref(c.slug)} onClick={close}>
                          {c.name}
                        </NavItem>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <Heading>Siyasi Partiler</Heading>
                  <ul>
                    {partyCats.map((c) => (
                      <li key={c.slug}>
                        <PartyItem cat={c} onClick={close} />
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-5">
                  <div>
                    <Heading>Servisler</Heading>
                    <ul>
                      {SERVICE_LINKS.map((link) => (
                        <li key={link.href}>
                          <NavItem href={link.href} onClick={close}>
                            {link.label}
                          </NavItem>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Heading>Kurumsal</Heading>
                    <ul>
                      {CORPORATE_LINKS.map((link) => (
                        <li key={link.href}>
                          <NavItem href={link.href} onClick={close}>
                            {link.label}
                          </NavItem>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </div>
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
