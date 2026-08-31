"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tipSchema } from "@/lib/validation";
import { submitTipAction } from "@/actions/tip";
import { serializeAttachmentUrls } from "@/lib/attachments";
import { AttachmentUploadField } from "@/components/forms/AttachmentUploadField";
import { TurnstileWidget } from "@/components/captcha/TurnstileWidget";
import { captchaConfigured } from "@/lib/captcha-client";
import { FieldGroup, Input, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { z } from "zod";

type TipValues = z.infer<typeof tipSchema>;

export function TipForm() {
  const [done, setDone] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [captchaToken, setCaptchaToken] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TipValues>({ resolver: zodResolver(tipSchema) });

  const onSubmit = async (values: TipValues) => {
    if (captchaConfigured() && !captchaToken) {
      setError("Güvenlik doğrulamasını tamamlayın.");
      return;
    }

    setLoading(true);
    setError(null);
    const result = await submitTipAction({
      ...values,
      attachmentUrl: serializeAttachmentUrls(attachments) ?? undefined,
      captchaToken,
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setEmailSent(Boolean(result?.emailSent));
    setDone(true);
    setAttachments([]);
    setCaptchaToken("");
    reset();
  };

  if (done) {
    return (
      <div className="border border-border bg-surface p-6 text-center">
        <p className="text-lg font-extrabold text-ink">İhbarınız alındı</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Teşekkür ederiz. Ekibimiz en kısa sürede değerlendirecek; uygun görülürse yayına alınacaktır.
          Kimliğiniz gizli tutulur.
          {emailSent ? (
            <>
              {" "}
              Onay e-postası adresinize gönderildi.
            </>
          ) : null}
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-5 text-sm font-semibold text-brand hover:underline"
        >
          Yeni ihbar gönder
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FieldGroup label="İhbarınız" htmlFor="message" error={errors.message?.message}>
        <Textarea
          id="message"
          rows={7}
          placeholder="Olayı, yeri ve zamanı mümkün olduğunca net yazın..."
          {...register("message")}
        />
      </FieldGroup>

      <AttachmentUploadField value={attachments} onChange={setAttachments} />

      <FieldGroup
        label="İletişim bilgisi (isteğe bağlı)"
        htmlFor="contactInfo"
        error={errors.contactInfo?.message}
      >
        <Input
          id="contactInfo"
          placeholder="E-posta veya telefon — e-posta yazarsanız onay mesajı alırsınız"
          {...register("contactInfo")}
        />
      </FieldGroup>

      <TurnstileWidget onToken={setCaptchaToken} />

      {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Gönderiliyor..." : "İhbarı Gönder"}
      </Button>
    </form>
  );
}
