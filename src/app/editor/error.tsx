"use client";

import { ErrorPage } from "@/components/site/ErrorPage";

export default function EditorError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      code="500"
      title="Editör paneli yüklenemedi"
      message="Geçici bir sorun oluştu. Birkaç saniye sonra tekrar deneyin."
      reset={reset}
    />
  );
}
