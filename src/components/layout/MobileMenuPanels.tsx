"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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

function Group({
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
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full min-h-9 items-center justify-between rounded-lg px-3 text-left transition-colors active:bg-surface"
      >
        <span className="text-[13px] font-bold uppercase tracking-[0.04em] text-ink-soft">
          {title}
        </span>
        <ChevronRight
          className={cn(
            "h-4 w-4 text-ink-soft/70 transition-transform duration-200 ease-out motion-reduce:transition-none",
            open && "rotate-90",
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
          <div className="pb-1 pl-1">{children}</div>
        </div>
      </div>
    </div>
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
        "flex min-h-10 items-center rounded-lg px-3 text-[15px] font-medium text-ink transition-colors active:bg-surface",
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
      className="flex min-h-10 items-center gap-2.5 rounded-xl px-3 text-[14px] font-medium text-ink transition-colors active:bg-surface"
    >
      {logo ? (
        <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-border/70">
          <Image src={logo} alt="" fill className="object-contain p-0.5" sizes="24px" unoptimized />
        </span>
      ) : (
        <span className="h-5 w-1 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      )}
      <span className="min-w-0 leading-snug">{cat.name}</span>
    </Link>
  );
}

function mergeLinks(primary: SiteMenuLink[] | undefined, fallback: SiteMenuLink[]) {
  const byHref = new Map<string, SiteMenuLink>();
  for (const link of fallback) byHref.set(link.href, link);
  for (const link of primary ?? []) byHref.set(link.href, link);
  // TarifPark gibi dış linkleri en sonda tut
  return [...byHref.values()].sort((a, b) => {
    const aExt = /^https?:\/\//i.test(a.href) ? 1 : 0;
    const bExt = /^https?:\/\//i.test(b.href) ? 1 : 0;
    return aExt - bExt;
  });
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
  const serviceLinks = mergeLinks(services, SERVICE_LINKS);
  const corporateLinks = mergeLinks(corporate, CORPORATE_LINKS);

  return (
    <div className="pb-1">
      <NavLink href="/" onClick={onNavigate} className="font-semibold">
        Anasayfa
      </NavLink>
      {sections.news.map((c) => (
        <NavLink key={c.slug} href={categoryHref(c.slug)} onClick={onNavigate}>
          {c.name}
        </NavLink>
      ))}

      {sections.districts.length > 0 ? (
        <Group title="Bölge">
          <div className="grid grid-cols-2 gap-x-0.5">
            {sections.districts.map((c) => (
              <NavLink
                key={c.slug}
                href={categoryHref(c.slug)}
                onClick={onNavigate}
                className="min-h-10 text-[14px]"
              >
                {c.name}
              </NavLink>
            ))}
          </div>
        </Group>
      ) : null}

      {sections.parties.length > 0 ? (
        <Group title="Siyasi Partiler">
          {sections.parties.map((c) => (
            <PartyLink key={c.slug} cat={c} onClick={onNavigate} />
          ))}
        </Group>
      ) : null}

      <Group title="Servisler">
        {serviceLinks.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className="min-h-10 text-[14px]"
          >
            {link.label}
          </NavLink>
        ))}
      </Group>

      <Group title="Kurumsal">
        {corporateLinks.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className="min-h-10 text-[14px]"
          >
            {link.label}
          </NavLink>
        ))}
      </Group>
    </div>
  );
}
