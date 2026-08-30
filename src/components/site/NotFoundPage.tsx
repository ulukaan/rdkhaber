import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { Logo } from "@/components/layout/Logo";

const quickLinks = [
  { href: "/", label: "Anasayfa" },
  { href: "/gundem", label: "Gündem" },
  { href: "/ekonomi", label: "Ekonomi" },
  { href: "/bolge-kategorileri", label: "Bölge Haberleri" },
  { href: "/yazarlar", label: "Yazarlar" },
  { href: "/iletisim", label: "İletişim" },
];

export async function NotFoundPage() {
  const settings = await getSettings();
  const year = new Date().getFullYear();

  return (
    <div className="fixed inset-0 z-[200] flex min-h-dvh flex-col overflow-auto bg-[linear-gradient(165deg,#fff5f5_0%,#ffffff_42%,#f4f5f7_100%)]">
      <div className="h-1 shrink-0 bg-brand" aria-hidden />

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <span className="absolute -right-6 top-[18%] select-none text-[clamp(11rem,38vw,26rem)] font-black leading-none tracking-tighter text-brand/[0.07]">
          404
        </span>
        <span className="absolute -left-16 bottom-[12%] h-64 w-64 rounded-full bg-brand/[0.04] blur-3xl" />
        <span className="absolute right-[10%] top-[8%] h-40 w-40 rounded-full bg-brand/[0.06] blur-2xl" />
      </div>

      <header className="relative shrink-0 border-b border-brand/10 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo siteName={settings.siteName} logoUrl={settings.logoUrl || undefined} />
          <Link
            href="/"
            className="hidden text-sm font-semibold text-ink-soft transition hover:text-brand sm:inline"
          >
            Anasayfaya dön
          </Link>
        </div>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
        <div className="w-full max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand shadow-sm">
            Hata 404
          </p>

          <h1 className="mt-6 text-[clamp(2.5rem,8vw,4.5rem)] font-black leading-none tracking-tight text-ink">
            Sayfa bulunamadı
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">
            Aradığınız sayfa taşınmış, silinmiş veya hiç yayınlanmamış olabilir. Aşağıdan
            arama yapabilir veya popüler bölümlere gidebilirsiniz.
          </p>

          <form action="/arama" method="get" className="mx-auto mt-8 flex max-w-lg gap-2">
            <label htmlFor="not-found-search" className="sr-only">
              Haber ara
            </label>
            <input
              id="not-found-search"
              type="search"
              name="q"
              placeholder="Haber, konu veya anahtar kelime ara…"
              className="h-12 min-w-0 flex-1 border border-border bg-white px-4 text-sm text-ink shadow-sm outline-none transition placeholder:text-ink-soft/70 focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
            <button
              type="submit"
              className="h-12 shrink-0 bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Ara
            </button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex h-12 items-center bg-brand px-6 text-sm font-semibold text-white shadow-md shadow-brand/20 transition hover:bg-brand-dark"
            >
              Anasayfaya dön
            </Link>
            <Link
              href="/arama"
              className="inline-flex h-12 items-center border border-border bg-white px-6 text-sm font-semibold text-ink transition hover:border-brand hover:text-brand"
            >
              Haber ara
            </Link>
          </div>

          <nav
            className="mt-10 border-t border-border/70 pt-8"
            aria-label="Popüler bölümler"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
              Popüler bölümler
            </p>
            <ul className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex h-9 items-center border border-border/80 bg-white/90 px-3.5 text-sm font-medium text-ink transition hover:border-brand hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>

      <footer className="relative shrink-0 border-t border-border/60 bg-white/60 py-4 text-center text-xs text-ink-soft backdrop-blur-sm">
        © {year}{" "}
        <span className="font-semibold text-brand">{settings.siteName}</span>
        <span className="mx-2 text-border">·</span>
        Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
