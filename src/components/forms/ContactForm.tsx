"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "@/lib/validation";
import { submitContactAction } from "@/actions/tip";
import { FieldGroup, Input, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { z } from "zod";

type ContactValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (values: ContactValues) => {
    setLoading(true);
    setError(null);
    const result = await submitContactAction(values);
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
      <div className="border border-border bg-surface p-4 text-sm font-semibold text-ink">
        Mesajınız bize ulaştı. En kısa sürede dönüş yapacağız.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup label="Ad soyad" htmlFor="name" error={errors.name?.message}>
        <Input id="name" autoComplete="name" {...register("name")} />
      </FieldGroup>
      <FieldGroup label="E-posta" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
      </FieldGroup>
      <FieldGroup label="Telefon (isteğe bağlı)" htmlFor="phone" error={errors.phone?.message}>
        <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
      </FieldGroup>
      <FieldGroup label="Mesajınız" htmlFor="message" error={errors.message?.message}>
        <Textarea
          id="message"
          rows={6}
          placeholder="İletmek istediğiniz konuyu yazın..."
          {...register("message")}
        />
      </FieldGroup>
      {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}
      <Button type="submit" disabled={loading} className="mt-1 w-full">
        {loading ? "Gönderiliyor..." : "Mesajı Gönder"}
      </Button>
    </form>
  );
}
