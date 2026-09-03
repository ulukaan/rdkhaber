"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { isActiveNavHref } from "@/lib/category-path";
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
          "group/item relative flex items-center gap-3 whitespace-nowrap px-4 py-2.5 text-[13px] font-semibold transition-colors",
          active
            ? "bg-brand/[0.06] text-brand"
            : "text-ink/90 hover:bg-brand/[0.04] hover:text-brand",
        )}
        aria-current={active ? "page" : undefined}
      >
        <span
          className={cn(
            "h-1 w-1 shrink-0 bg-brand transition-opacity",
            active ? "opacity-100" : "opacity-0 group-hover/item:opacity-100",
          )}
          aria-hidden
        />
        <span className="min-w-0">{child.label}</span>
      </Link>
    </li>
  );
}

export function CategoryNav({ items }: { items: NavLink[] }) {
  const pathname = usePathname();
  const links = items.filter((item) => !isTarifPark(item.href));
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <nav
      className="hidden h-14 min-w-0 flex-1 lg:block"
      aria-label="Kategoriler"
    >
      <ul className="scrollbar-none flex h-full min-w-0 items-stretch overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {links.map((item, i) => {
          const key = `${item.href}-${i}`;
          const children = item.children?.filter((c) => c.visible !== false) ?? [];
          const hasChildren = children.length > 0;
          const active = isActiveNavHref(pathname, item.href);
          const childActive = children.some((c) => isActiveNavHref(pathname, c.href));
          const open = openKey === key;
          const highlighted = active || childActive || open;

          return (
            <li
              key={key}
              className="relative h-full shrink-0"
              onMouseEnter={() => hasChildren && setOpenKey(key)}
              onMouseLeave={() => setOpenKey((current) => (current === key ? null : current))}
            >
              <Link
                href={item.href}
                className={cn(
                  "relative flex h-full items-center gap-1 whitespace-nowrap px-2.5 text-[12px] font-black uppercase tracking-[0.03em] transition-colors xl:px-3 xl:text-[12.5px]",
                  highlighted ? "text-brand" : "text-ink/75 hover:text-ink",
                )}
                aria-expanded={hasChildren ? open : undefined}
                aria-haspopup={hasChildren ? "menu" : undefined}
              >
                <span
                  className={cn(
                    "absolute inset-x-2 bottom-0 h-[3px] origin-left bg-brand transition-transform duration-200",
                    highlighted ? "scale-x-100" : "scale-x-0",
                  )}
                  aria-hidden
                />
                {item.label}
                {hasChildren ? (
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 opacity-60 transition-transform duration-200",
                      open && "rotate-180 opacity-100",
                    )}
                    aria-hidden
                  />
                ) : null}
              </Link>

              {hasChildren && open ? (
                <div
                  className="absolute top-full left-0 z-40 min-w-[280px] border border-border bg-white shadow-[0_12px_32px_rgba(15,23,42,0.12)]"
                  role="menu"
                >
                  <div className="flex items-center gap-2 border-b border-border bg-surface/70 px-4 py-2.5">
                    <span className="h-3 w-[3px] bg-brand" aria-hidden />
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/55">
                      {item.label}
                    </p>
                  </div>
                  <ul className="py-1.5">
                    {children.map((child, j) => (
                      <DropdownChildLink
                        key={`${child.href}-${j}`}
                        child={child}
                        active={isActiveNavHref(pathname, child.href)}
                      />
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
