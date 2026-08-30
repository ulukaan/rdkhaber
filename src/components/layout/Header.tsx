import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { flattenNavLinks, getNavItems } from "@/lib/nav-menu";
import { getPrayerTimes, getNextPrayerSlot } from "@/lib/prayer-times";
import { getCityWeather } from "@/lib/weather";
import { CITY_COOKIE, resolveCity } from "@/lib/cities";
import { cookies } from "next/headers";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";
import { TopBar } from "@/components/layout/TopBar";
import { CategoryNav } from "@/components/layout/CategoryNav";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { MobileCategoryStrip } from "@/components/layout/MobileCategoryStrip";
import { mobileStripFromCategories } from "@/lib/mobile-category-strip";
import { BreakingTicker } from "@/components/layout/BreakingTicker";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { SiteMegaMenu } from "@/components/layout/SiteMegaMenu";
import { RatesBar } from "@/components/layout/RatesBar";
import { HeaderShell } from "@/components/layout/HeaderShell";
import { auth } from "@/auth";
import { panelPathForRole } from "@/lib/role";
import { TarifParkLink } from "@/components/layout/TarifParkLink";

export async function Header() {
  const cookieStore = await cookies();
  const city = resolveCity(cookieStore.get(CITY_COOKIE)?.value);

  const [categories, settings, session, headerNav, weather, prayers, serviceNav, corporateNav] =
    await Promise.all([
      prisma.category.findMany({
        orderBy: { order: "asc" },
        select: { name: true, slug: true },
      }),
      getSettings(),
      auth(),
      getNavItems("header"),
      getCityWeather(city),
      getPrayerTimes(city),
      getNavItems("footer_services"),
      getNavItems("footer_corporate"),
    ]);

  const nextPrayer = prayers ? getNextPrayerSlot(prayers) : null;

  const account = session?.user
    ? {
        authenticated: true as const,
        name: session.user.name?.split(" ")[0] ?? "Hesabım",
        panelHref: panelPathForRole(session.user.role),
      }
    : { authenticated: false as const };

  const socials = [
    { href: settings.facebookUrl, label: "Facebook" },
    { href: settings.twitterUrl, label: "X" },
    { href: settings.instagramUrl, label: "Instagram" },
    { href: settings.youtubeUrl, label: "YouTube" },
  ].filter((s) => s.href && s.href !== "#");

  const serviceLinks = flattenNavLinks(serviceNav);
  const corporateLinks = flattenNavLinks(corporateNav);

  const mobileStrip = mobileStripFromCategories(categories);

  return (
    <HeaderShell
      top={
        <TopBar
          whatsappNumber={settings.whatsappNumber}
          citySlug={city.slug}
          weather={weather}
          nextPrayer={nextPrayer}
        />
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
                <div className="hidden md:block">
                  <AccountMenu />
                </div>
                <SiteMegaMenu
                  categories={categories}
                  socials={socials}
                  services={serviceLinks}
                  corporate={corporateLinks}
                  whatsappNumber={settings.whatsappNumber}
                />
                <MobileMenu
                  categories={categories}
                  whatsappNumber={settings.whatsappNumber}
                  account={account}
                  socials={socials}
                />
              </div>
            </Container>
          </div>
          <MobileCategoryStrip items={mobileStrip} />
        </>
      }
      extras={
        settings.showRates !== "0" || settings.showTicker !== "0" ? (
          <>
            {settings.showRates !== "0" ? <RatesBar /> : null}
            {settings.showTicker !== "0" ? <BreakingTicker /> : null}
          </>
        ) : null
      }
    />
  );
}
