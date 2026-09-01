"use client";

import { ErrorPage } from "@/components/site/ErrorPage";
import "./globals.css";

export default function RootGlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="tr">
      <body className="min-h-full antialiased">
        <ErrorPage
          code="500"
          title="Beklenmeyen bir hata oluştu"
          message="Sistem geçici olarak yanıt veremiyor. Sayfayı yenileyin veya anasayfadan devam edin."
          reset={reset}
        />
      </body>
    </html>
  );
}
