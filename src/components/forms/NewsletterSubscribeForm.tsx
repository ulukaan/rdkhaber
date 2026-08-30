"use client";

import { clientFormSubmit } from "@/lib/client-form";

import { useState } from "react";
import { subscribeNewsletterAction } from "@/actions/newsletter";
import { Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function NewsletterSubscribeForm({ compact = false }: { compact?: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const result = await subscribeNewsletterAction({
      email: String(formData.get("email") ?? ""),
      name: String(formData.get("name") ?? ""),
      website: String(formData.get("website") ?? ""),
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setOk(true);
  };

  if (ok) {
    return (
      <p className="text-sm font-semibold text-ink">
        Abone oldunuz. Yeni bültenler bu adrese gelir.
      </p>
    );
  }

  return (
    <form
      onSubmit={clientFormSubmit(onSubmit)}
      className={compact ? "relative flex flex-col gap-2" : "relative flex max-w-md flex-col gap-3"}
    >
      {compact ? null : (
        <Input name="name" placeholder="Adınız (isteğe bağlı)" autoComplete="name" />
      )}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      />
      <div className={compact ? "flex gap-2" : "flex flex-col gap-2 sm:flex-row"}>
        <Input
          name="email"
          type="email"
          required
          placeholder="E-posta adresiniz"
          autoComplete="email"
          className="flex-1"
        />
        <Button type="submit" disabled={loading} className="shrink-0">
          {loading ? "Kaydediliyor..." : "Abone ol"}
        </Button>
      </div>
      {error ? <p className="text-xs font-medium text-brand">{error}</p> : null}
      <p className="text-[11px] leading-4 text-ink-soft">
        Abone olarak gizlilik politikamızı kabul etmiş olursunuz. İstediğiniz zaman çıkabilirsiniz.
      </p>
    </form>
  );
}
