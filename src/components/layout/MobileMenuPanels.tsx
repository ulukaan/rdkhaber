"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { categoryHref } from "@/lib/category-path";
import { partyColor, partyLogoUrl } from "@/lib/party-logos";
import {
  buildSiteMenuSections,
  CORPORATE_LINKS,
  SERVICE_LINKS,
  type SiteMenuCategory,
  type SiteMenuLink,
} from "@/lib/site-menu-sections";
import { cn } from "@/lib/utils";

function AccordionSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-border/70 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full min-h-[48px] items-center justify-between gap-3 px-4 py-3 text-left transition-colors active:bg-surface/80"
      >
        <span className="text-[15px] font-semibold tracking-tight text-ink">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-ink-soft transition-transform duration-200 motion-reduce:transition-none",
            open && "rotate-180",
          )}
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
          <div className="space-y-0.5 px-3 pb-3">{children}</div>
        </div>
      </div>
    </section>
  );
}

function NavLink({
  href,
  children,
  onClick,
  className,
}: {
  href: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex min-h-[44px] items-center rounded-xl px-3 text-[15px] font-medium text-ink/90 transition-colors active:bg-surface",
        className,
      )}
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
      className="flex min-h-[44px] items-center gap-2.5 rounded-xl px-3 text-[14px] font-medium text-ink/90 transition-colors active:bg-surface"
    >
      {logo ? (
        <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md border border-border/80 bg-white">
          <Image src={logo} alt="" fill className="object-contain p-0.5" sizes="28px" unoptimized />
        </span>
      ) : (
        <span className="h-7 w-1 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      )}
      <span className="min-w-0 leading-snug">{cat.name}</span>
    </Link>
  );
}

export function MobileMenuPanels({
  categories,
  services,
  corporate,
  onNavigate,
}: {
  categories: SiteMenuCategory[];
  services?: SiteMenuLink[];
  corporate?: SiteMenuLink[];
  onNavigate: () => void;
}) {
  const sections = buildSiteMenuSections(categories);
  const serviceLinks = services?.length ? services : SERVICE_LINKS;
  const corporateLinks = corporate?.length ? corporate : CORPORATE_LINKS;

  return (
    <div className="pb-2">
      <AccordionSection title="Haberler" defaultOpen>
        <NavLink href="/" onClick={onNavigate}>
          Anasayfa
        </NavLink>
        {sections.news.map((c) => (
          <NavLink key={c.slug} href={categoryHref(c.slug)} onClick={onNavigate}>
            {c.name}
          </NavLink>
        ))}
      </AccordionSection>

      {sections.districts.length > 0 ? (
        <AccordionSection title="Bölge">
          <div className="grid grid-cols-2 gap-x-1">
            {sections.districts.map((c) => (
              <NavLink key={c.slug} href={categoryHref(c.slug)} onClick={onNavigate}>
                {c.name}
              </NavLink>
            ))}
          </div>
        </AccordionSection>
      ) : null}

      {sections.parties.length > 0 ? (
        <AccordionSection title="Siyasi Partiler">
          {sections.parties.map((c) => (
            <PartyLink key={c.slug} cat={c} onClick={onNavigate} />
          ))}
        </AccordionSection>
      ) : null}

      <AccordionSection title="Servisler">
        {serviceLinks.map((link) => (
          <NavLink key={link.href} href={link.href} onClick={onNavigate}>
            {link.label}
          </NavLink>
        ))}
      </AccordionSection>

      <AccordionSection title="Kurumsal">
        {corporateLinks.map((link) => (
          <NavLink key={link.href} href={link.href} onClick={onNavigate}>
            {link.label}
          </NavLink>
        ))}
      </AccordionSection>
    </div>
  );
}
