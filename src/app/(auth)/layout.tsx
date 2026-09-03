import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { Logo } from "@/components/layout/Logo";
import { YerliUretimBadge } from "@/components/brand/YerliUretimBadge";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const year = new Date().getFullYear();

  return (
    <div className="auth-shell flex min-h-svh flex-col bg-white lg:flex-row">
      <aside className="auth-brand-panel relative flex min-h-[220px] flex-col justify-between overflow-hidden bg-brand px-6 py-7 text-white sm:px-8 lg:min-h-svh lg:w-[44%] lg:max-w-xl lg:px-12 lg:py-12">
        <div className="auth-brand-drift pointer-events-none absolute inset-0" aria-hidden />
        <div className="auth-brand-sheen pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative z-[1]">
          <Logo siteName={settings.siteName} logoUrl={settings.logoUrl || undefined} variant="light" />
        </div>
        <div className="relative z-[1] mt-10 max-w-md text-center lg:mt-0 lg:self-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/70">
            Üye alanı
          </p>
          <h1 className="mt-3 text-3xl font-black leading-[1.1] tracking-tight sm:text-4xl lg:text-[2.75rem]">
            {settings.siteName}
          </h1>
          <p className="mx-auto mt-4 max-w-[28ch] text-sm leading-relaxed text-white/85 sm:text-base">
            {settings.siteSlogan?.trim() ||
              "Düzce ve Türkiye gündemini takip edin, hesabınızla kişiselleştirin."}
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AuthHeader siteName={settings.siteName} logoUrl={settings.logoUrl || undefined} />
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="mt-auto border-t border-border px-5 py-4 sm:px-8">
          <div className="flex w-full items-center justify-between gap-4">
            <p className="text-xs text-ink-soft">
              © {year}{" "}
              <Link href="/" className="font-semibold text-brand">
                {settings.siteName}
              </Link>
            </p>
            <YerliUretimBadge />
          </div>
        </footer>
      </div>
    </div>
  );
}
