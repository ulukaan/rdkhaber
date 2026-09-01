"use client";

import { useState, useTransition } from "react";
import {
  disableTotpAction,
  enableTotpAction,
  getTotpStatusAction,
  startTotpSetupAction,
} from "@/actions/two-factor";
import { FieldGroup, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function TwoFactorForm({ initialEnabled }: { initialEnabled: boolean }) {
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
    });
  };

  return (
    <div className="max-w-lg space-y-5 rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-ink">İki adımlı doğrulama (TOTP)</h2>
          <p className="mt-1 text-xs text-ink-soft">
            Google Authenticator veya benzeri uygulama ile personel girişini koruyun.
          </p>
        </div>
        <Badge variant={enabled ? "brand" : "outline"}>{enabled ? "Aktif" : "Kapalı"}</Badge>
      </div>

      {!enabled && !setup ? (
        <Button type="button" onClick={onStart} disabled={pending}>
          {pending ? "Hazırlanıyor..." : "2FA kurulumunu başlat"}
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
            {pending ? "Doğrulanıyor..." : "2FA'yı etkinleştir"}
          </Button>
        </div>
      ) : null}

      {enabled && process.env.NODE_ENV !== "production" ? (
        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-xs text-ink-soft">Devre dışı bırakmak için mevcut kodu girin.</p>
          <FieldGroup label="Doğrulama kodu" htmlFor="disable-code">
            <Input
              id="disable-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </FieldGroup>
          <Button type="button" variant="outline" onClick={onDisable} disabled={pending || code.length < 6}>
            {pending ? "İşleniyor..." : "2FA'yı kapat"}
          </Button>
        </div>
      ) : null}

      {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
    </div>
  );
}
