import Link from "next/link";
import {
  BadgeDollarSign,
  BarChart3,
  ExternalLink,
  Search,
  Settings,
  Tags,
} from "lucide-react";
import { PanelCard, SectionHeader } from "@/components/admin/PanelUI";
import type { DashboardGoogleStatus } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const SERVICES = [
  {
    key: "analytics",
    label: "Google Analytics 4",
    Icon: BarChart3,
    active: (g: DashboardGoogleStatus) => g.analyticsActive,
    value: (g: DashboardGoogleStatus) => g.analyticsId,
    href: "https://analytics.google.com/",
    hint: "Ziyaretçi ve sayfa görüntüleme",
  },
  {
    key: "gtm",
    label: "Tag Manager",
    Icon: Tags,
    active: (g: DashboardGoogleStatus) => g.gtmActive,
    value: (g: DashboardGoogleStatus) => g.gtmId,
    href: "https://tagmanager.google.com/",
    hint: "Etiket ve dönüşüm yönetimi",
  },
  {
    key: "search",
    label: "Search Console",
    Icon: Search,
    active: (g: DashboardGoogleStatus) => g.searchConsoleActive,
    value: (g: DashboardGoogleStatus) =>
      g.searchConsoleActive ? "Site doğrulandı" : "",
    href: "https://search.google.com/search-console",
    hint: "Arama performansı ve indeks",
  },
  {
    key: "adsense",
    label: "Google AdSense",
    Icon: BadgeDollarSign,
    active: (g: DashboardGoogleStatus) => g.adsenseActive,
    value: (g: DashboardGoogleStatus) => g.adsenseClient,
    href: "https://adsense.google.com/",
    hint: (g: DashboardGoogleStatus) =>
      g.adsenseAuto ? "Otomatik reklamlar açık" : "Manuel reklam slotları",
  },
] as const;

export function DashboardGoogleStatus({ google }: { google: DashboardGoogleStatus }) {
  const activeCount = [
    google.analyticsActive,
    google.gtmActive,
    google.searchConsoleActive,
    google.adsenseActive,
  ].filter(Boolean).length;

  return (
    <PanelCard className="mt-8">
      <SectionHeader
        title="Google Site Kit"
        description={
          activeCount > 0
            ? `${activeCount}/4 servis yapılandırıldı · Çerez onayı ile birlikte çalışır`
            : "Analytics, arama ve reklam ayarları henüz tanımlanmadı"
        }
        action={
          <Link
            href="/admin/gorunum/google"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
          >
            <Settings className="h-3.5 w-3.5" />
            Ayarları düzenle
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {SERVICES.map((service) => {
          const active = service.active(google);
          const value = service.value(google);
          const hint =
            typeof service.hint === "function" ? service.hint(google) : service.hint;

          return (
            <div
              key={service.key}
              className={cn(
                "flex flex-col rounded-xl border p-4 transition-colors",
                active ? "border-emerald-200 bg-emerald-50/60" : "border-border bg-surface/40",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    active ? "bg-emerald-600 text-white" : "bg-white text-ink-soft",
                  )}
                >
                  <service.Icon className="h-5 w-5" />
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    active ? "bg-emerald-600 text-white" : "bg-border text-ink-soft",
                  )}
                >
                  {active ? "Aktif" : "Kapalı"}
                </span>
              </div>

              <p className="mt-3 text-sm font-bold text-ink">{service.label}</p>
              <p className="mt-0.5 text-[11px] text-ink-soft">{hint}</p>

              {value ? (
                <p className="mt-2 truncate font-mono text-[11px] font-semibold text-ink/80" title={value}>
                  {value}
                </p>
              ) : (
                <p className="mt-2 text-[11px] italic text-ink-soft">Kimlik tanımlı değil</p>
              )}

              <a
                href={service.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
              >
                Google&apos;da aç
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
}
