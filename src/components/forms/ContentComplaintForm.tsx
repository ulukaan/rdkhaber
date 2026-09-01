"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submitContentComplaintAction } from "@/actions/content-complaint";
import { TurnstileWidget } from "@/components/captcha/TurnstileWidget";
import { captchaConfigured } from "@/lib/captcha-client";
import { FieldGroup, Input, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  name: z.string().min(2, "Adınızı girin"),
  email: z.string().email("Geçerli e-posta girin"),
  phone: z.string().optional(),
  articleUrl: z.string().optional(),
  message: z.string().min(20, "Mesaj en az 20 karakter olmalı"),
});

type Values = z.infer<typeof schema>;

export function ContentComplaintForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    if (captchaConfigured() && !captchaToken) {
      setError("Güvenlik doğrulamasını tamamlayın.");
      return;
    }

    setLoading(true);
    setError(null);
    const result = await submitContentComplaintAction({
      ...values,
      captchaToken,
      website: honeypot,
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setDone(true);
    reset();
  };

  if (done) {
    return (
      <div className="border border-border bg-surface p-6 text-center">
        <p className="font-extrabold text-ink">Başvurunuz alındı</p>
        <p className="mt-2 text-sm text-ink-soft">En kısa sürede değerlendirilecektir.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label="Ad Soyad" htmlFor="name" error={errors.name?.message}>
          <Input id="name" {...register("name")} />
        </FieldGroup>
        <FieldGroup label="E-posta" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" {...register("email")} />
        </FieldGroup>
      </div>
      <FieldGroup label="Telefon (isteğe bağlı)" htmlFor="phone">
        <Input id="phone" {...register("phone")} />
      </FieldGroup>
      <FieldGroup label="Haber bağlantısı (varsa)" htmlFor="articleUrl">
        <Input id="articleUrl" placeholder="https://..." {...register("articleUrl")} />
      </FieldGroup>
      <FieldGroup label="Şikayet / düzeltme talebi" htmlFor="message" error={errors.message?.message}>
        <Textarea id="message" rows={6} {...register("message")} />
      </FieldGroup>

      <TurnstileWidget onToken={setCaptchaToken} />

      {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Gönderiliyor..." : "Başvuruyu gönder"}
      </Button>
    </form>
  );
}
