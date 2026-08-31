"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
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

function PartyItem({ cat, onClick }: { cat: SiteMenuCategory; onClick: () => void }) {
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
        <span className="h-6 w-1 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      )}
      <span className="min-w-0 leading-snug">{cat.name}</span>
    </Link>
  );
}

export function SiteMenuPanels({
  categories,
  services,
  corporate,
  onNavigate,
  stacked = false,
}: {
  categories: SiteMenuCategory[];
  services?: SiteMenuLink[];
  corporate?: SiteMenuLink[];
  onNavigate: () => void;
  stacked?: boolean;
}) {
  const sections = buildSiteMenuSections(categories);
  const serviceLinks = services?.length ? services : SERVICE_LINKS;
  const corporateLinks = corporate?.length ? corporate : CORPORATE_LINKS;

  return (
    <div
      className={cn(
        stacked
          ? "flex flex-col gap-6 px-4 py-4"
          : "mx-auto grid max-w-[1100px] gap-6 px-4 py-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 md:px-5",
      )}
    >
      <section>
        <Heading>Haberler</Heading>
        <ul>
          <li>
            <NavItem href="/" onClick={onNavigate}>
              Anasayfa
            </NavItem>
          </li>
          {sections.news.map((c) => (
            <li key={c.slug}>
              <NavItem href={categoryHref(c.slug)} onClick={onNavigate}>
                {c.name}
              </NavItem>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Heading>Bölge</Heading>
        <ul className="grid grid-cols-2 gap-x-2">
          {sections.districts.map((c) => (
            <li key={c.slug}>
              <NavItem href={categoryHref(c.slug)} onClick={onNavigate}>
                {c.name}
              </NavItem>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Heading>Siyasi Partiler</Heading>
        <ul>
          {sections.parties.map((c) => (
            <li key={c.slug}>
              <PartyItem cat={c} onClick={onNavigate} />
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-5">
        <div>
          <Heading>Servisler</Heading>
          <ul>
            {serviceLinks.map((link) => (
              <li key={link.href}>
                <NavItem href={link.href} onClick={onNavigate}>
                  {link.label}
                </NavItem>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Heading>Kurumsal</Heading>
          <ul>
            {corporateLinks.map((link) => (
              <li key={link.href}>
                <NavItem href={link.href} onClick={onNavigate}>
                  {link.label}
                </NavItem>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
