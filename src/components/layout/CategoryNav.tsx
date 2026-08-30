"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { isActiveNavHref } from "@/lib/category-path";
import { TarifParkLink } from "@/components/layout/TarifParkLink";
import type { NavLink } from "@/lib/nav-menu";

function isTarifPark(href: string) {
  return /tarifpark\.com/i.test(href);
}

function DropdownChildLink({
  child,
  active,
}: {
  child: NavLink;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={child.href}
        className={cn(
          "block whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors",
          active
            ? "bg-surface text-brand"
            : "text-ink hover:bg-surface hover:text-brand",
        )}
        aria-current={active ? "page" : undefined}
      >
        {child.label}
      </Link>
    </li>
  );
}

export function CategoryNav({ items }: { items: NavLink[] }) {
  const pathname = usePathname();
  const links = items.filter((item) => !isTarifPark(item.href));
  const alreadyInNav = items.some((item) => isTarifPark(item.href));
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <nav className="hidden h-14 min-w-0 flex-1 overflow-visible lg:block" aria-label="Kategoriler">
      <ul className="flex h-full items-center">
        {links.map((item, i) => {
          const key = `${item.href}-${i}`;
          const children = item.children?.filter((c) => c.visible !== false) ?? [];
          const hasChildren = children.length > 0;
          const active = isActiveNavHref(pathname, item.href);
          const childActive = children.some((c) => isActiveNavHref(pathname, c.href));
          const open = openKey === key;

          return (
            <li
              key={key}
              className="relative h-full"
              onMouseEnter={() => hasChildren && setOpenKey(key)}
              onMouseLeave={() => setOpenKey((current) => (current === key ? null : current))}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex h-full items-center gap-1.5 whitespace-nowrap border-b-2 px-2.5 text-[13px] font-extrabold tracking-tight transition-colors xl:px-3 xl:text-sm",
                  active || childActive
                    ? "border-brand text-brand"
                    : "border-transparent text-ink/80 hover:text-brand",
                )}
              >
                {item.label}
                {hasChildren ? (
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")}
                    aria-hidden
                  />
                ) : null}
              </Link>

              {hasChildren && open ? (
                <ul className="absolute top-full left-0 z-40 min-w-[240px] border border-border bg-white py-1 shadow-lg">
                  {children.map((child, j) => (
                    <DropdownChildLink
                      key={`${child.href}-${j}`}
                      child={child}
                      active={isActiveNavHref(pathname, child.href)}
                    />
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
        <li className={alreadyInNav ? "h-full" : "h-full xl:hidden"}>
          <TarifParkLink />
        </li>
      </ul>
    </nav>
  );
}
