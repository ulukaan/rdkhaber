"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/validation";
import { registerAction } from "@/actions/register";
import { FieldGroup, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { z } from "zod";

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverInfo, setServerInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterValues) => {
    setServerError(null);
    setServerInfo(null);
    setLoading(true);
    const result = await registerAction(values);
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

      {serverError ? <p className="text-sm font-medium text-brand">{serverError}</p> : null}
      {serverInfo ? <p className="text-sm font-medium text-ink-soft">{serverInfo}</p> : null}

      <Button type="submit" disabled={loading} className="mt-2 w-full">
        {loading ? "Kayıt olunuyor..." : "Kayıt Ol"}
      </Button>
    </form>
  );
}
