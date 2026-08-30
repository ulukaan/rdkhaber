"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/validation";
import { resetPasswordAction } from "@/actions/password-reset";
import { FieldGroup, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { z } from "zod";

type Values = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", passwordConfirm: "" },
  });

  const onSubmit = async (values: Values) => {
    setServerError(null);
    setSuccess(null);
    setLoading(true);
    const result = await resetPasswordAction(values);
    setLoading(false);
    if (result && "error" in result && result.error) {
      setServerError(result.error);
      return;
    }
    if (result && "message" in result && result.message) setSuccess(result.message);
  };

  if (success) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium text-emerald-700">{success}</p>
        <Link
          href="/giris"
          className="inline-flex h-10 items-center justify-center rounded-md bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input type="hidden" {...register("token")} />
      <FieldGroup label="Yeni şifre" htmlFor="password" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
        />
      </FieldGroup>
      <FieldGroup
        label="Yeni şifre (tekrar)"
        htmlFor="passwordConfirm"
        error={errors.passwordConfirm?.message}
      >
        <Input
          id="passwordConfirm"
          type="password"
          autoComplete="new-password"
          {...register("passwordConfirm")}
        />
      </FieldGroup>

      {serverError && <p className="text-sm font-medium text-brand">{serverError}</p>}

      <Button type="submit" disabled={loading} className="mt-2 w-full">
        {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
      </Button>
    </form>
  );
}
