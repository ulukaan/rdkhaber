import Link from "next/link";
import { AuthCard } from "@/components/ui/AuthCard";
import { RegisterForm } from "@/components/forms/RegisterForm";

export const metadata = { title: "Kayıt Ol" };

export default function RegisterPage() {
  return (
    <AuthCard title="Kayıt Ol" subtitle="Ücretsiz üye olun, haberleri takip edin.">
      <RegisterForm />
      <p className="mt-6 border-t border-border/80 pt-5 text-center text-sm text-ink-soft">
        Zaten hesabınız var mı?{" "}
        <Link href="/giris" className="font-semibold text-brand hover:underline">
          Giriş yapın
        </Link>
      </p>
    </AuthCard>
  );
}
