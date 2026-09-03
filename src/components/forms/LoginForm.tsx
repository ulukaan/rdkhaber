"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { loginSchema } from "@/lib/validation";
import { loginAction, verify2faLoginAction } from "@/actions/login";
import { TurnstileWidget } from "@/components/captcha/TurnstileWidget";
import { captchaConfigured } from "@/lib/captcha-client";
import { FieldGroup, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [step2, setStep2] = useState<{
    userId: string;
    challenge: string;
    email: string;
    password: string;
  } | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    setLoading(true);

    if (captchaConfigured() && !captchaToken) {
      setLoading(false);
      setServerError("Güvenlik doğrulamasını tamamlayın.");
      return;
    }

    const result = await loginAction({
      email: values.email,
      password: values.password,
      captchaToken,
    });
    setLoading(false);

    if (result?.error) {
      setServerError(result.error);
      return;
    }

    if (result?.requires2fa) {
      setStep2({
        userId: result.userId,
        challenge: result.challenge,
        email: values.email,
        password: values.password,
      });
      return;
    }

    router.push("/post-giris");
    router.refresh();
  };

  const onVerify2fa = async () => {
    if (!step2) return;
    setLoading(true);
    setServerError(null);
    const result = await verify2faLoginAction({
      ...step2,
      code: totpCode,
    });
    setLoading(false);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    router.push("/post-giris");
    router.refresh();
  };

  if (step2) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-soft">Authenticator uygulamanızdaki 6 haneli kodu girin.</p>
        <FieldGroup label="Doğrulama kodu" htmlFor="totp">
          <Input
            id="totp"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
          />
        </FieldGroup>
        {serverError ? <p className="text-sm font-medium text-brand">{serverError}</p> : null}
        <Button type="button" disabled={loading} className="w-full" onClick={onVerify2fa}>
          {loading ? "Doğrulanıyor..." : "Doğrula ve giriş yap"}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup label="E-posta" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
      </FieldGroup>
      <FieldGroup label="Şifre" htmlFor="password" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
        />
      </FieldGroup>

      <TurnstileWidget onToken={setCaptchaToken} />

      <div className="-mt-1 flex justify-end">
        <Link
          href="/sifremi-unuttum"
          className="text-[12px] font-extrabold uppercase tracking-wide text-brand transition-opacity hover:opacity-80"
        >
          Şifremi unuttum
        </Link>
      </div>

      {serverError && <p className="text-sm font-medium text-brand">{serverError}</p>}

      <Button type="submit" disabled={loading} className="mt-1 h-12 w-full rounded-none text-[13px] font-extrabold uppercase tracking-[0.08em]">
        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>

      {process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED === "1" ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => signIn("google", { callbackUrl: "/post-giris" })}
        >
          Google ile devam et
        </Button>
      ) : null}
    </form>
  );
}
