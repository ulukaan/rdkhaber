"use client";

import { ErrorPage } from "@/components/site/ErrorPage";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      code="500"
      title="Sayfa yüklenemedi"
      message="Geçici bir sunucu sorunu oluştu. Lütfen birkaç saniye sonra tekrar deneyin."
      reset={reset}
    />
  );
}
