"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validation";
import { requestPasswordResetAction } from "@/actions/password-reset";
import { FieldGroup, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { z } from "zod";

type Values = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: Values) => {
    setServerError(null);
    setSuccess(null);
    setLoading(true);
    const result = await requestPasswordResetAction(values);
    setLoading(false);
    if (result && "error" in result && result.error) {
      setServerError(result.error);
      return;
    }
    if (result && "message" in result && result.message) setSuccess(result.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup label="E-posta" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
      </FieldGroup>

      {serverError && <p className="text-sm font-medium text-brand">{serverError}</p>}
      {success && <p className="text-sm font-medium text-emerald-700">{success}</p>}

      <Button type="submit" disabled={loading} className="mt-1 h-12 w-full rounded-none text-[13px] font-extrabold uppercase tracking-[0.08em]">
        {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
      </Button>
    </form>
  );
}
