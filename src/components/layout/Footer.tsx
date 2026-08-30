import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";
import { getSettings } from "@/lib/settings";
import { flattenNavLinks, getNavItems } from "@/lib/nav-menu";
import { prisma } from "@/lib/prisma";
import { categoryHref } from "@/lib/category-path";
import { SocialIcon } from "@/components/icons/SocialIcons";
import { NewsletterSubscribeForm } from "@/components/forms/NewsletterSubscribeForm";

const linkClass =
  "block text-[13px] leading-6 text-ink-soft transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

type FooterLink = { label: string; href: string };

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  if (links.length === 0) return null;
  return (
    <div>
      <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-ink">
        {title}
      </h2>
      <ul className="space-y-1.5">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link
              href={link.href}
              className={linkClass}
              {...(link.href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function Footer() {
  const [footerNav, serviceNav, corporateNav, settings, categories] = await Promise.all([
    getNavItems("footer"),
    getNavItems("footer_services"),
    getNavItems("footer_corporate"),
    getSettings(),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { name: true, slug: true },
      take: 8,
    }),
  ]);

  const socials = [
    { url: settings.facebookUrl, label: "Facebook", name: "facebook" as const },
    { url: settings.twitterUrl, label: "X (Twitter)", name: "x" as const },
    { url: settings.instagramUrl, label: "Instagram", name: "instagram" as const },
    { url: settings.youtubeUrl, label: "YouTube", name: "youtube" as const },
  ].filter((s) => s.url && s.url !== "#");

  const year = new Date().getFullYear();
  const copyright = settings.copyrightText || `© ${year} ${settings.siteName}`;
  const slogan =
    settings.siteSlogan?.trim() || "Yerel ve ulusal gündemi tarafsız aktaran haber platformu.";
  const disclaimer = settings.footerAbout?.trim() || "";

  const categoryLinks: FooterLink[] =
    footerNav.length > 0
      ? flattenNavLinks(footerNav).slice(0, 12)
      : categories.map((c) => ({ label: c.name, href: categoryHref(c.slug) }));

  const serviceLinks = flattenNavLinks(serviceNav);
  const corporateLinks = flattenNavLinks(corporateNav);

  return (
    <footer className="footer mt-16 border-t border-border bg-surface text-ink">
      <Container>
        <div className="grid gap-10 py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
          <div>
            <Logo siteName={settings.siteName} logoUrl={settings.logoUrl} />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">{slogan}</p>
            <div className="mt-5 max-w-sm">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-ink">Bülten</p>
              <NewsletterSubscribeForm compact />
            </div>
            {socials.length > 0 ? (
              <ul className="mt-5 flex items-center gap-2" aria-label="Sosyal medya">
                {socials.map(({ url, label, name }) => (
                  <li key={name}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-9 w-9 items-center justify-center border border-border bg-white text-ink/70 transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      <SocialIcon name={name} />
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <nav
            className="grid grid-cols-2 gap-8 sm:grid-cols-3"
            aria-label="Footer menü"
          >
            <FooterColumn title="Kategoriler" links={categoryLinks} />
            <FooterColumn title="Servisler" links={serviceLinks} />
            <FooterColumn title="Kurumsal" links={corporateLinks} />
          </nav>
        </div>

        {disclaimer ? (
          <p className="border-t border-border py-5 text-[11px] leading-5 text-ink-soft sm:text-xs sm:leading-6">
            {disclaimer}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 border-t border-border py-5 text-xs text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>{copyright}</p>
          <p>
            Tasarım: <span className="font-semibold text-ink">Samet Dursun</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
