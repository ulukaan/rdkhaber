import { Suspense } from "react";
import { getSettings } from "@/lib/settings";
import { flattenNavLinks, getNavItems } from "@/lib/nav-menu";
import { getCategoriesForNav } from "@/lib/categories";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { SiteMegaMenu } from "@/components/layout/SiteMegaMenu";
import { BreakingTicker } from "@/components/layout/BreakingTicker";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { RatesBar } from "@/components/layout/RatesBar";
import { HeaderShell } from "@/components/layout/HeaderShell";
import { TarifParkLink } from "@/components/layout/TarifParkLink";
import { HeaderTopBarServer } from "@/components/layout/HeaderTopBarServer";
import { MobileMenuWithSession } from "@/components/layout/MobileMenuWithSession";
import { MobileCategoryStrip } from "@/components/layout/MobileCategoryStrip";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

function HeaderExtrasSkeleton() {
  return <div className="h-9 animate-pulse bg-ink/5" aria-hidden />;
}

export async function Header() {
  const [categories, settings, headerNav, serviceNav, corporateNav] = await Promise.all([
    getCategoriesForNav(),
    getSettings(),
    getNavItems("header"),
    getNavItems("footer_services"),
    getNavItems("footer_corporate"),
  ]);

  const socials = [
    { href: settings.facebookUrl, label: "Facebook" },
    { href: settings.twitterUrl, label: "X" },
    { href: settings.instagramUrl, label: "Instagram" },
    { href: settings.youtubeUrl, label: "YouTube" },
  ].filter((s) => s.href && s.href !== "#");

  const serviceLinks = flattenNavLinks(serviceNav);
  const corporateLinks = flattenNavLinks(corporateNav);

  return (
    <HeaderShell
      top={
        <Suspense fallback={<div className="h-9 bg-ink/5" aria-hidden />}>
          <HeaderTopBarServer />
        </Suspense>
      }
      main={
        <>
          <div className="relative border-b border-border">
            <Container className="flex h-14 items-center gap-2 sm:gap-3">
              <Logo siteName={settings.siteName} logoUrl={settings.logoUrl} />
              <CategoryNav items={headerNav} />
              <nav
                className="hidden shrink-0 items-center gap-3 border-l border-border pl-3 xl:flex"
                aria-label="Servisler"
              >
                <TarifParkLink />
              </nav>
              <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
                <ThemeToggle />
                <div className="hidden md:block">
                  <Suspense fallback={null}>
                    <AccountMenu />
                  </Suspense>
                </div>
                <SiteMegaMenu
                  categories={categories}
                  socials={socials}
                  services={serviceLinks}
                  corporate={corporateLinks}
                  whatsappNumber={settings.whatsappNumber}
                />
                <Suspense fallback={null}>
                  <MobileMenuWithSession
                    siteName={settings.siteName}
                    logoUrl={settings.logoUrl}
                    categories={categories}
                    whatsappNumber={settings.whatsappNumber}
                    socials={socials}
                    services={serviceLinks}
                    corporate={corporateLinks}
                  />
                </Suspense>
              </div>
            </Container>
          </div>
          <MobileCategoryStrip items={headerNav} />
        </>
      }
      extras={
        settings.showRates !== "0" || settings.showTicker !== "0" ? (
          <>
            {settings.showRates !== "0" ? (
              <Suspense fallback={<HeaderExtrasSkeleton />}>
                <RatesBar />
              </Suspense>
            ) : null}
            {settings.showTicker !== "0" ? (
              <Suspense fallback={<HeaderExtrasSkeleton />}>
                <BreakingTicker />
              </Suspense>
            ) : null}
          </>
        ) : null
      }
    />
  );
}
