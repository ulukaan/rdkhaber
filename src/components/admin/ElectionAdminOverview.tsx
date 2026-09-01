"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Database, ExternalLink, RefreshCw, ShieldCheck } from "lucide-react";
import {
  refreshElectionEngineAction,
  verifyElectionSnapshotAction,
} from "@/actions/election";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/admin/FormCard";
import type { ElectionEngineSummary } from "@/lib/election-engine";
import type { SnapshotKind } from "@prisma/client";

const KIND_LABELS: Record<SnapshotKind, string> = {
  PROVISIONAL: "Ön sonuç",
  UPDATED: "Güncellenen sonuç",
  FINAL: "Kesin sonuç",
};

export type ElectionAdminOverviewProps = {
  electionId: string;
  slug: string;
  engine: ElectionEngineSummary | null;
  snapshot?: {
    kind: SnapshotKind;
    label: string | null;
    publishedAt: string;
    verified: boolean;
    sourceName: string;
    sourceUrl?: string | null;
    importedAt: string;
  } | null;
};

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("tr-TR");
}

export function ElectionAdminOverview({
  electionId,
  slug,
  engine,
  snapshot,
}: ElectionAdminOverviewProps) {
  const router = useRouter();
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onVerify = async () => {
    setVerifyLoading(true);
    setMessage(null);
    setError(null);
    const result = await verifyElectionSnapshotAction(electionId);
    setVerifyLoading(false);
    if (result && "error" in result) {
      setError(result.error);
      return;
    }
    setMessage("Sonuç özeti resmî olarak doğrulandı.");
    router.refresh();
  };

  const onRefresh = async () => {
    setRefreshLoading(true);
    setMessage(null);
    setError(null);
    const result = await refreshElectionEngineAction(electionId);
    setRefreshLoading(false);
    if (result && "error" in result) {
      setError(result.error);
      return;
    }
    setMessage("Veri motoru yenilendi; yeni sonuç özeti yayınlandı.");
    router.refresh();
  };

  return (
    <FormCard
      title="Veri motoru ve yayın"
      description="Parti/kişi eşlemesi, coğrafya, ittifaklar, sonuç özeti ve canlı sayfa bağlantısı."
      Icon={Database}
      className="mb-4"
    >
      <div className="flex flex-col gap-4 text-sm">
        <div className="flex flex-wrap gap-2">
          <Button href="/secim" variant="outline" size="sm" className="w-full sm:w-auto">
            <ExternalLink className="h-4 w-4" />
            /secim sayfasını aç
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshLoading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${refreshLoading ? "animate-spin" : ""}`} />
            {refreshLoading ? "Yenileniyor..." : "Motoru yenile"}
          </Button>
        </div>

        {engine ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Dönem" value={engine.periodName ?? "—"} />
            <Stat label="Tur" value={engine.roundLabel ? `${engine.roundLabel} · ${engine.roundStatus}` : "—"} />
            <Stat
              label="İl"
              value={
                engine.provinceSlug
                  ? `${engine.provinceSlug}${engine.provincePlateId ? ` (${engine.provincePlateId})` : ""}`
                  : "—"
              }
            />
            <Stat label="Kişi bağlantısı" value={`${engine.personLinkedCount}/${engine.candidateCount}`} />
            <Stat label="Coğrafya birimi" value={String(engine.geoUnitCount)} />
            <Stat label="İttifak" value={String(engine.alliances.length)} />
          </div>
        ) : null}

        {engine && engine.alliances.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Aktif ittifaklar</p>
            <ul className="space-y-2">
              {engine.alliances.map((alliance) => (
                <li
                  key={alliance.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface/40 px-3 py-2"
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: alliance.color ?? "#b9c5d1" }}
                    aria-hidden
                  />
                  <span className="font-semibold text-ink">{alliance.name}</span>
                  <span className="text-xs text-ink-soft">{alliance.parties.join(" · ")}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {engine && engine.councilSeats.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Meclis sandalye dağılımı</p>
            <div className="flex flex-wrap gap-2">
              {engine.councilSeats.map((seat) => (
                <span
                  key={`${seat.allianceId ?? seat.partyId ?? seat.label}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-ink"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: seat.color }} aria-hidden />
                  {seat.label}: {seat.seats}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-border bg-surface/30 p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Aktif sonuç özeti</p>
          {!snapshot ? (
            <p className="text-ink-soft">
              Henüz yayında bir özet yok. Kayıt, YSK senkronu veya &quot;Motoru yenile&quot; ile oluşturulur.
            </p>
          ) : (
            <>
              <p className="text-ink-soft">
                Kaynak:{" "}
                {snapshot.sourceUrl ? (
                  <a href={snapshot.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand hover:underline">
                    {snapshot.sourceName}
                  </a>
                ) : (
                  <span className="font-semibold text-ink">{snapshot.sourceName}</span>
                )}
                {" · "}
                İçe aktarım: <strong>{formatTime(snapshot.importedAt)}</strong>
                {" · "}
                Yayın: <strong>{formatTime(snapshot.publishedAt)}</strong>
              </p>
              <p className="mt-1">
                Durum:{" "}
                <strong className={snapshot.verified ? "text-brand" : "text-amber-700"}>
                  {snapshot.verified
                    ? `✓ ${KIND_LABELS.FINAL} (doğrulandı)`
                    : `${KIND_LABELS[snapshot.kind]} — resmî doğrulama bekleniyor`}
                </strong>
                {snapshot.label ? <span className="text-ink-soft"> ({snapshot.label})</span> : null}
              </p>
              {!snapshot.verified ? (
                <div className="mt-3">
                  <Button type="button" size="sm" onClick={onVerify} disabled={verifyLoading} className="w-full sm:w-auto">
                    <ShieldCheck className={`h-4 w-4 ${verifyLoading ? "animate-pulse" : ""}`} />
                    {verifyLoading ? "Doğrulanıyor..." : "Resmî sonuç olarak doğrula"}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>

        <p className="text-xs text-ink-soft">
          Slug: <Link href={`/admin/secim/${electionId}`} className="font-mono text-ink hover:text-brand">{slug}</Link>
          {" · "}
          <strong>Güncelle</strong> yalnızca formu kaydeder. Parti/kişi eşlemesi, coğrafya ve yayın özeti için{" "}
          <strong>Motoru yenile</strong> kullanın; yeni seçim oluşturulduğunda motor ilk kez otomatik çalışır.
        </p>

        {message ? <p className="font-medium text-success">{message}</p> : null}
        {error ? <p className="font-medium text-brand">{error}</p> : null}
      </div>
    </FormCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="mt-0.5 font-semibold text-ink">{value}</p>
    </div>
  );
}
