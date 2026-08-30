"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { loginSchema } from "@/lib/validation";
import { FieldGroup, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    setLoading(true);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      setServerError("E-posta veya şifre hatalı.");
      return;
    }

    // Rol bazlı yönlendirme bir Route Handler'da yapıldığı için tam sayfa
    // gezinmesi gerekir — router.push() Route Handler'ları tetiklemez.
    // eslint-disable-next-line react-hooks/immutability, @next/next/no-location-assign-relative-destination
    window.location.href = "/post-giris";
  };

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

      <div className="-mt-1 text-right">
        <Link href="/sifremi-unuttum" className="text-xs font-semibold text-brand hover:underline">
          Şifremi unuttum
        </Link>
      </div>

      {serverError && <p className="text-sm font-medium text-brand">{serverError}</p>}

      <Button type="submit" disabled={loading} className="mt-2 w-full">
        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </Button>
    </form>
  );
}
