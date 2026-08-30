"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { MobileStripItem } from "@/lib/mobile-category-strip";

export function MobileCategoryStrip({ items }: { items: MobileStripItem[] }) {
  const pathname = usePathname();
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Hızlı kategoriler"
      className="border-b border-border bg-white lg:hidden"
    >
      <div className="scrollbar-none flex gap-1 overflow-x-auto px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "bg-brand text-white"
                  : "bg-surface text-ink hover:bg-brand/10 hover:text-brand",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
