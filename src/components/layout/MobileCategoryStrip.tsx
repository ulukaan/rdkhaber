"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isActiveNavHref } from "@/lib/category-path";
import type { NavLink } from "@/lib/nav-menu";

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

export function MobileCategoryStrip({ items }: { items: NavLink[] }) {
  const pathname = usePathname();
  const links = items.filter((item) => item.visible !== false && !/tarifpark\.com/i.test(item.href));
  if (links.length === 0) return null;

  return (
    <nav
      aria-label="Kategoriler"
      className="border-b border-border bg-white lg:hidden"
    >
      <div className="scrollbar-none flex gap-1 overflow-x-auto px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {links.map((item, index) => {
          const key = `${item.href}-${index}`;
          const children = item.children?.filter((c) => c.visible !== false) ?? [];
          const active =
            isActiveNavHref(pathname, item.href) ||
            children.some((child) => isActiveNavHref(pathname, child.href));
          const className = cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            active
              ? "bg-brand text-white"
              : "bg-surface text-ink hover:bg-brand/10 hover:text-brand",
          );

          if (isExternal(item.href)) {
            return (
              <a
                key={key}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {item.label}
              </a>
            );
          }

          return (
            <Link
              key={key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={className}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
