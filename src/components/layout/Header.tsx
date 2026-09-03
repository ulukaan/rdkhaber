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
import { NotificationBellServer } from "@/components/layout/NotificationBellServer";
import { GuestLibrarySync } from "@/components/account/GuestLibrarySync";
import { ElectionHomeTopBarServer } from "@/components/election/ElectionHomeTopBarServer";

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
      prepend={
        <Suspense fallback={<div className="h-[100px] animate-pulse bg-brand/10" aria-hidden />}>
          <ElectionHomeTopBarServer />
        </Suspense>
      }
      top={
        <Suspense fallback={<div className="h-9 bg-ink/5" aria-hidden />}>
          <HeaderTopBarServer />
        </Suspense>
      }
      main={
        <>
          <div className="relative border-b border-brand bg-brand text-white lg:border-border lg:bg-background lg:text-ink">
            <Container className="flex h-14 min-w-0 items-center gap-2 sm:gap-3">
              <span className="shrink-0 lg:hidden">
                <Logo siteName={settings.siteName} logoUrl={settings.logoUrl} variant="light" />
              </span>
              <span className="hidden shrink-0 lg:contents">
                <Logo siteName={settings.siteName} logoUrl={settings.logoUrl} />
              </span>
              <CategoryNav items={headerNav} />
              <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
                <div className="hidden lg:block">
                  <TarifParkLink />
                </div>
                <ThemeToggle className="border-white/35 bg-white/15 hover:border-white lg:border-border lg:bg-surface lg:hover:border-brand" />
                <span className="hidden h-6 w-px bg-border md:block" aria-hidden />
                <div className="hidden items-center gap-1 md:flex">
                  <Suspense fallback={null}>
                    <NotificationBellServer />
                  </Suspense>
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
          <GuestLibrarySync />
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
