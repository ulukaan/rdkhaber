"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema } from "@/lib/validation";
import { submitCommentAction } from "@/actions/comment";
import { FieldGroup, Input, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { z } from "zod";

type CommentValues = z.infer<typeof commentSchema>;

export function CommentForm({
  articleId,
  userName,
}: {
  articleId: string;
  userName?: string | null;
}) {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loggedIn = Boolean(userName?.trim());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      articleId,
      authorName: userName?.trim() || "",
      authorEmail: "",
      content: "",
    },
  });

  const onSubmit = async (values: CommentValues) => {
    setLoading(true);
    setError(null);
    const result = await submitCommentAction(values);
    setLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setDone(true);
    reset({
      articleId,
      content: "",
      authorName: userName?.trim() || "",
      authorEmail: "",
    });
  };

  if (done) {
    return (
      <div className="border border-border bg-surface p-5 text-center">
        <p className="text-sm font-extrabold text-ink">Yorumunuz alındı</p>
        <p className="mt-1 text-xs text-ink-soft">
          Editör onayından sonra burada yayınlanacak.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-4 text-sm font-semibold text-brand hover:underline"
        >
          Yeni yorum yaz
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 border border-border bg-white p-4 sm:p-5"
    >
      <input type="hidden" {...register("articleId")} />

      {loggedIn ? (
        <>
          <input type="hidden" {...register("authorName")} />
          <input type="hidden" {...register("authorEmail")} />
          <p className="text-sm text-ink-soft">
            <span className="font-semibold text-ink">{userName}</span> olarak yorum yapıyorsunuz.
            Üyelik zorunlu değil; ziyaretçiler de yorum bırakabilir.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-ink-soft">
            Giriş yapmadan da yorum yazabilirsiniz. Yorumlar onaylandıktan sonra yayınlanır.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FieldGroup label="Adınız" htmlFor="authorName" error={errors.authorName?.message}>
              <Input id="authorName" autoComplete="name" {...register("authorName")} />
            </FieldGroup>
            <FieldGroup
              label="E-posta (isteğe bağlı)"
              htmlFor="authorEmail"
              error={errors.authorEmail?.message}
            >
              <Input
                id="authorEmail"
                type="email"
                autoComplete="email"
                {...register("authorEmail")}
              />
            </FieldGroup>
          </div>
        </>
      )}

      <FieldGroup label="Yorumunuz" htmlFor="content" error={errors.content?.message}>
        <Textarea
          id="content"
          rows={4}
          placeholder="Görüşünüzü yazın..."
          {...register("content")}
        />
      </FieldGroup>

      {error ? <p className="text-sm font-medium text-brand">{error}</p> : null}

      <Button type="submit" disabled={loading} className="w-full sm:w-fit">
        {loading ? "Gönderiliyor..." : "Yorumu Gönder"}
      </Button>
    </form>
  );
}
