"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { syncElectionFromYskAction } from "@/actions/election";
import { Button } from "@/components/ui/Button";
import { FormCard } from "@/components/admin/FormCard";

export type ElectionYskPanelProps = {
  electionId: string;
  yskSyncEnabled?: boolean;
  yskLastSyncAt?: string | null;
  yskLastSyncError?: string | null;
};

function formatSyncTime(value?: string | null) {
  if (!value) return "Henüz senkronize edilmedi";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("tr-TR");
}

export function ElectionYskPanel({
  electionId,
  yskSyncEnabled,
  yskLastSyncAt,
  yskLastSyncError,
}: ElectionYskPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSync = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    const result = await syncElectionFromYskAction(electionId);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    if ("success" in result && result.success) {
      setMessage(
        `YSK verisi güncellendi — ${result.candidateCount ?? 0} aday, ${result.districtCount ?? 0} ilçe.`,
      );
      router.refresh();
    }
  };

  return (
    <FormCard
      title="YSK API"
      description="Resmî YSK açık veri portalından sandık ve aday sonuçlarını çeker."
      Icon={RefreshCw}
      className="mb-4"
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-ink-soft">
          Otomatik senkron: <strong>{yskSyncEnabled ? "Açık" : "Kapalı"}</strong>
          {" · "}
          Son güncelleme: <strong>{formatSyncTime(yskLastSyncAt)}</strong>
        </p>
        {yskLastSyncError ? (
          <p className="rounded-xl border border-brand/20 bg-brand/5 px-3 py-2 text-sm text-brand">
            Son hata: {yskLastSyncError}
          </p>
        ) : null}
        {message ? <p className="text-sm font-medium text-success">{message}</p> : null}
        {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
        <div>
          <Button
            type="button"
            onClick={onSync}
            disabled={loading}
            className="w-full sm:w-auto"
            aria-label="YSK verisini şimdi güncelle"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "YSK'dan çekiliyor..." : "YSK'dan güncelle"}
          </Button>
        </div>
        <p className="text-xs text-ink-soft">
          Varsayılan: 31 Mart 2024 mahalli seçim, Düzce (il 81), belediye başkanlığı. Ayarları Genel sekmesinden
          değiştirebilirsiniz.
        </p>
      </div>
    </FormCard>
  );
}
