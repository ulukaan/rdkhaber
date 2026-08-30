"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/Logo";

const links = [
  { href: "/giris", label: "Giriş" },
  { href: "/kayit", label: "Kayıt Ol" },
  { href: "/", label: "Anasayfa" },
] as const;

export function AuthHeader({
  siteName,
  logoUrl,
}: {
  siteName: string;
  logoUrl?: string;
}) {
  const pathname = usePathname();

  return (
    <header className="border-b border-brand/15 bg-white shadow-[0_2px_16px_rgba(208,2,27,0.06)]">
      <div className="h-1 bg-brand" aria-hidden />
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Logo siteName={siteName} logoUrl={logoUrl} />
        <nav className="flex items-center gap-2 sm:gap-3" aria-label="Hesap menüsü">
          {links.map(({ href, label }) => {
            const active = href !== "/" && pathname === href;
            const isCta = href === "/kayit";
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                  isCta
                    ? "bg-brand text-white hover:bg-brand-dark"
                    : active
                      ? "bg-brand/10 text-brand"
                      : "text-ink/80 hover:bg-surface hover:text-brand",
                )}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
