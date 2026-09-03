"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validation";
import { registerAction } from "@/actions/register";
import { TurnstileWidget } from "@/components/captcha/TurnstileWidget";
import { captchaConfigured } from "@/lib/captcha-client";
import { FieldGroup, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { z } from "zod";

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverInfo, setServerInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterValues) => {
    setServerError(null);
    setServerInfo(null);

    if (captchaConfigured() && !captchaToken) {
      setServerError("Güvenlik doğrulamasını tamamlayın.");
      return;
    }

    setLoading(true);
    const result = await registerAction({ ...values, captchaToken, website: honeypot });
    setLoading(false);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    if (result?.message) {
      setServerInfo(result.message);
    }
  };

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
      <FieldGroup label="Ad Soyad" htmlFor="name" error={errors.name?.message}>
        <Input id="name" autoComplete="name" {...register("name")} />
      </FieldGroup>
      <FieldGroup label="E-posta" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
      </FieldGroup>
      <FieldGroup label="Şifre" htmlFor="password" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
        />
      </FieldGroup>

      <TurnstileWidget onToken={setCaptchaToken} />

      {serverError ? <p className="text-sm font-medium text-brand">{serverError}</p> : null}
      {serverInfo ? <p className="text-sm font-medium text-ink-soft">{serverInfo}</p> : null}

      <Button type="submit" disabled={loading} className="mt-1 h-12 w-full rounded-none text-[13px] font-extrabold uppercase tracking-[0.08em]">
        {loading ? "Kayıt olunuyor..." : "Kayıt Ol"}
      </Button>
    </form>
  );
}
