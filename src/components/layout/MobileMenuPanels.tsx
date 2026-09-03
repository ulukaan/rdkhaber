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
    <section className="border-b border-border/50 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full min-h-[44px] items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors active:bg-surface/70"
      >
        <span className="text-[14px] font-semibold tracking-tight text-ink">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-ink-soft/80 transition-transform duration-200 ease-out motion-reduce:transition-none",
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
          <div className="space-y-0.5 px-2.5 pb-2.5">{children}</div>
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
        "flex min-h-[40px] items-center rounded-lg px-2.5 text-[14px] font-medium text-ink/85 transition-colors active:bg-surface",
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
      className="flex min-h-[40px] items-center gap-2 rounded-lg px-2.5 text-[13px] font-medium text-ink/85 transition-colors active:bg-surface"
    >
      {logo ? (
        <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md border border-border/70 bg-white">
          <Image src={logo} alt="" fill className="object-contain p-0.5" sizes="24px" unoptimized />
        </span>
      ) : (
        <span className="h-6 w-1 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
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
    <div>
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
          <div className="grid grid-cols-2 gap-x-0.5">
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
