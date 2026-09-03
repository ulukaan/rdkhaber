"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/giris", label: "Giriş" },
  { href: "/kayit", label: "Kayıt" },
] as const;

export function AuthHeader(_props: { siteName: string; logoUrl?: string }) {
  const pathname = usePathname();

  return (
    <header className="shrink-0 border-b border-border bg-white">
      <div className="flex h-12 w-full items-center justify-between gap-4 px-5 sm:h-14 sm:px-8">
        <nav className="flex h-full items-stretch" aria-label="Hesap menüsü">
          {tabs.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex h-full items-center border-b-[3px] px-3 text-[12px] font-extrabold uppercase tracking-[0.08em] transition-colors sm:px-4",
                  active
                    ? "border-brand text-brand"
                    : "border-transparent text-ink/55 hover:text-ink",
                )}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-extrabold uppercase tracking-wide text-ink/60 transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Anasayfa
        </Link>
      </div>
    </header>
  );
}
