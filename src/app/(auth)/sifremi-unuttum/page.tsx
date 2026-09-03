import Link from "next/link";
import { AuthCard } from "@/components/ui/AuthCard";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export const metadata = { title: "Şifremi Unuttum" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Şifremi Unuttum"
      subtitle="Kayıtlı e-posta adresinize güvenli bir sıfırlama bağlantısı gönderelim."
    >
      <ForgotPasswordForm />
      <p className="mt-8 border-t border-border pt-5 text-sm text-ink-soft">
        <Link href="/giris" className="font-extrabold text-brand hover:underline">
          ← Giriş sayfasına dön
        </Link>
      </p>
    </AuthCard>
  );
}
