import Link from "next/link";
import { AuthCard } from "@/components/ui/AuthCard";
import { RegisterForm } from "@/components/forms/RegisterForm";

export const metadata = { title: "Kayıt Ol" };

export default function RegisterPage() {
  return (
    <AuthCard title="Kayıt Ol" subtitle="Ücretsiz üye olun; gündemi, kaydettiklerinizi ve bildirimleri takip edin.">
      <RegisterForm />
      <p className="mt-8 border-t border-border pt-5 text-sm text-ink-soft">
        Zaten hesabınız var mı?{" "}
        <Link href="/giris" className="font-extrabold text-brand hover:underline">
          Giriş yapın
        </Link>
      </p>
    </AuthCard>
  );
}
