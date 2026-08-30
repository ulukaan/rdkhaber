import Link from "next/link";
import { AuthCard } from "@/components/ui/AuthCard";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export const metadata = { title: "Şifremi Unuttum" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Şifremi Unuttum"
      subtitle="Kayıtlı e-posta adresinize sıfırlama bağlantısı gönderelim."
    >
      <ForgotPasswordForm />
      <p className="mt-6 border-t border-border/80 pt-5 text-center text-sm text-ink-soft">
        <Link href="/giris" className="font-semibold text-brand hover:underline">
          Giriş sayfasına dön
        </Link>
      </p>
    </AuthCard>
  );
}
