"use client";

import { useState } from "react";
import {
  unsubscribeNewsletterAction,
  unsubscribeNewsletterByEmailAction,
} from "@/actions/newsletter";
import { Button } from "@/components/ui/Button";
import { FieldGroup, Input } from "@/components/ui/FormField";

export function NewsletterUnsubscribeForm({ token }: { token?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  if (ok) {
    return <p className="text-sm font-semibold text-ink">{ok}</p>;
  }

  const confirmWithToken = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const result = await unsubscribeNewsletterAction(token);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setOk("Aboneliğiniz iptal edildi. Bundan sonra bülten e-postası almazsınız.");
  };

  const confirmWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await unsubscribeNewsletterByEmailAction(email);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setOk(result.message ?? "Aboneliğiniz iptal edildi.");
  };

  if (token) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-ink-soft">Bülten e-postalarını durdurmak için onaylayın.</p>
        {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
        <Button type="button" onClick={confirmWithToken} disabled={loading}>
          {loading ? "İşleniyor..." : "Abonelikten çık"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={confirmWithEmail} className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-ink-soft">
        Abonelikten çıkmak için bültene kayıtlı e-posta adresinizi girin. Onay bağlantısı
        e-postanıza gönderilir.
      </p>
      <FieldGroup label="E-posta" htmlFor="unsubscribe-email">
        <Input
          id="unsubscribe-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@mail.com"
        />
      </FieldGroup>
      {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "İşleniyor..." : "Abonelikten çık"}
      </Button>
    </form>
  );
}
