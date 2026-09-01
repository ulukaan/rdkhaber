"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Radio } from "lucide-react";
import type { ElectionStatus } from "@prisma/client";
import { Logo } from "@/components/layout/Logo";
import { TodayDate } from "@/components/layout/TodayDate";
import { Container } from "@/components/ui/Container";
import { ElectionDistrictSelect } from "@/components/election/ElectionDistrictSelect";
import type { ElectionDistrictView } from "@/components/election/ElectionDistrictGrid";
import { ELECTION_STATUS_LABELS } from "@/lib/election";
import { cn, formatDate } from "@/lib/utils";

export function ElectionPageHeader({
  siteName,
  logoUrl,
  title,
  subtitle,
  status,
  liveRefreshSec,
  lastResultsAt,
  districts = [],
  selectedDistrict,
  onDistrictSelect,
}: {
  siteName: string;
  logoUrl?: string;
  title: string;
  subtitle?: string | null;
  status: ElectionStatus;
  liveRefreshSec: number;
  lastResultsAt?: string | null;
  districts?: ElectionDistrictView[];
  selectedDistrict?: string | null;
  onDistrictSelect?: (slug: string) => void;
}) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(liveRefreshSec);
  const isLive = status === "LIVE";

  useEffect(() => {
    if (!isLive) return;
    const tick = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          router.refresh();
          return liveRefreshSec;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(tick);
  }, [isLive, liveRefreshSec, router]);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-dark/20 bg-brand-dark shadow-md">
      <Container className="flex flex-col gap-3 py-3 text-white sm:flex-row sm:items-center sm:justify-between sm:py-3.5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Logo siteName={siteName} logoUrl={logoUrl} variant="light" />
          <div className="hidden h-8 w-px shrink-0 bg-white/20 sm:block" aria-hidden />
          <div className="min-w-0 border-l border-white/20 pl-3 sm:border-l-0 sm:pl-0">
            <h1 className="truncate text-base font-extrabold uppercase tracking-wide sm:text-lg">{title}</h1>
            {subtitle ? <p className="mt-0.5 truncate text-xs text-white/65">{subtitle}</p> : null}
          </div>
        </div>
        <span
          className={cn(
            "inline-flex w-fit shrink-0 items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
            isLive ? "bg-brand text-white" : "bg-white/10 text-white/80",
          )}
        >
          {isLive ? <Radio className="h-3 w-3 animate-pulse" /> : null}
          {ELECTION_STATUS_LABELS[status]}
        </span>
      </Container>

      <div className="border-t border-white/10 bg-surface">
        <Container className="flex h-9 items-center justify-between gap-3 text-[11px] text-ink-soft">
          <div className="flex min-w-0 items-center gap-3 overflow-hidden">
            <TodayDate />
            {districts.length > 0 && onDistrictSelect ? (
              <ElectionDistrictSelect
                districts={districts}
                value={selectedDistrict ?? ""}
                onChange={onDistrictSelect}
              />
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 text-right">
            {isLive ? (
              <span>
                Güncelleme: <strong className="text-ink">{secondsLeft} sn.</strong>
              </span>
            ) : (
              <span>Seçim sonuçları</span>
            )}
            {lastResultsAt ? <span className="hidden sm:inline">Son: {formatDate(new Date(lastResultsAt))}</span> : null}
          </div>
        </Container>
      </div>
    </header>
  );
}
