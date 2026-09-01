"use client";

import { ErrorPage } from "@/components/site/ErrorPage";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      code="500"
      title="Panel yüklenemedi"
      message="Yönetim paneli geçici olarak yanıt veremedi. Oturumunuz açıksa tekrar deneyin; sorun sürerse anasayfaya dönün."
      reset={reset}
    />
  );
}
