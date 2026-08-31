"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsSubmissionSchema } from "@/lib/validation";
import { submitNewsAction } from "@/actions/submission";
import { serializeAttachmentUrls } from "@/lib/attachments";
import { AttachmentUploadField } from "@/components/forms/AttachmentUploadField";
import { FieldGroup, Input, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { z } from "zod";

type SubmissionValues = z.infer<typeof newsSubmissionSchema>;

export function NewsSubmissionForm({ loggedIn }: { loggedIn: boolean }) {
  const [done, setDone] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmissionValues>({ resolver: zodResolver(newsSubmissionSchema) });

  const onSubmit = async (values: SubmissionValues) => {
    setLoading(true);
    setError(null);
    const result = await submitNewsAction({
      ...values,
      attachmentUrl: serializeAttachmentUrls(attachments) ?? undefined,
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setEmailSent(Boolean(result?.emailSent));
    setDone(true);
    setAttachments([]);
    reset();
  };

  if (done) {
    return (
      <div className="border border-border bg-surface p-6 text-center">
        <p className="text-lg font-extrabold text-ink">Haberiniz bize ulaştı</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Editörlerimiz inceledikten sonra uygun görülürse yayınlanacaktır. Katkınız için teşekkürler.
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
          Yeni haber gönder
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FieldGroup label="Haber başlığı" htmlFor="title" error={errors.title?.message}>
        <Input id="title" placeholder="Kısa ve net bir başlık" {...register("title")} />
      </FieldGroup>
      <FieldGroup label="Haber metni" htmlFor="content" error={errors.content?.message}>
        <Textarea
          id="content"
          rows={9}
          placeholder="Ne oldu, nerede, ne zaman? Bilgi kaynaklarınızı belirtin."
          {...register("content")}
        />
      </FieldGroup>

      <AttachmentUploadField
        value={attachments}
        onChange={setAttachments}
        label="Fotoğraf / video ekleri"
      />

      {!loggedIn ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup
            label="Adınız (isteğe bağlı)"
            htmlFor="submitterName"
            error={errors.submitterName?.message}
          >
            <Input id="submitterName" {...register("submitterName")} />
          </FieldGroup>
          <FieldGroup
            label="E-posta"
            htmlFor="submitterEmail"
            error={errors.submitterEmail?.message}
          >
            <Input
              id="submitterEmail"
              type="email"
              autoComplete="email"
              placeholder="Onay mesajı bu adrese gönderilir"
              {...register("submitterEmail", { required: "Onay e-postası için geçerli bir adres girin" })}
            />
          </FieldGroup>
        </div>
      ) : null}

      {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Gönderiliyor..." : "Haberi Gönder"}
      </Button>
    </form>
  );
}
