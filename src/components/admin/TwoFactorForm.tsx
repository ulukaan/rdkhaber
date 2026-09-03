"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  disableTotpAction,
  enableTotpAction,
  getTotpStatusAction,
  startTotpSetupAction,
} from "@/actions/two-factor";
import { FieldGroup, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function TwoFactorForm({
  initialEnabled,
  redirectAfterEnable,
}: {
  initialEnabled: boolean;
  redirectAfterEnable?: string;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onStart = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await startTotpSetupAction();
        setSetup({ secret: result.secret, uri: result.uri });
        setCode("");
      } catch {
        setError("Kurulum başlatılamadı.");
      }
    });
  };

  const onEnable = () => {
    setError(null);
    startTransition(async () => {
      const result = await enableTotpAction(code);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setEnabled(true);
      setSetup(null);
      setCode("");
      if (redirectAfterEnable) {
        router.push(redirectAfterEnable);
        router.refresh();
      } else {
        router.refresh();
      }
    });
  };

  const onDisable = () => {
    setError(null);
    startTransition(async () => {
      const result = await disableTotpAction(code);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setEnabled(false);
      setSetup(null);
      setCode("");
      await getTotpStatusAction();
      router.refresh();
    });
  };

  return (
    <div className="max-w-lg space-y-5 rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-ink">İki adımlı doğrulama (TOTP)</h2>
          <p className="mt-1 text-xs text-ink-soft">
            İsteğe bağlıdır. Google Authenticator veya benzeri uygulama ile hesabı ek
            koruyabilirsiniz; istediğiniz zaman kapatabilirsiniz.
          </p>
        </div>
        <Badge variant={enabled ? "brand" : "outline"} className="self-start">
          {enabled ? "Aktif" : "Kapalı"}
        </Badge>
      </div>

      {!enabled && !setup ? (
        <Button type="button" onClick={onStart} disabled={pending} className="w-full sm:w-auto">
          {pending ? "Hazırlanıyor..." : "2FA’yı aç"}
        </Button>
      ) : null}

      {setup ? (
        <div className="space-y-3 rounded-lg border border-border bg-surface/60 p-4 text-sm">
          <p className="font-semibold text-ink">1. Authenticator uygulamanıza ekleyin</p>
          <p className="break-all font-mono text-xs text-ink-soft">{setup.secret}</p>
          <p className="text-xs text-ink-soft">
            veya otpauth URI:{" "}
            <a href={setup.uri} className="text-brand underline">
              QR / bağlantı
            </a>
          </p>
          <FieldGroup label="2. Uygulamadaki 6 haneli kod" htmlFor="enable-code">
            <Input
              id="enable-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </FieldGroup>
          <Button type="button" onClick={onEnable} disabled={pending || code.length < 6}>
            {pending ? "Doğrulanıyor..." : "2FA’yı etkinleştir"}
          </Button>
        </div>
      ) : null}

      {enabled ? (
        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-xs text-ink-soft">Kapatmak için uygulamadaki 6 haneli kodu girin.</p>
          <FieldGroup label="Doğrulama kodu" htmlFor="disable-code">
            <Input
              id="disable-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </FieldGroup>
          <Button
            type="button"
            variant="outline"
            onClick={onDisable}
            disabled={pending || code.length < 6}
          >
            {pending ? "İşleniyor..." : "2FA’yı kapat"}
          </Button>
        </div>
      ) : null}

      {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
    </div>
  );
}
