import Link from "next/link";
import { AuthCard } from "@/components/ui/AuthCard";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata = { title: "Giriş Yap" };

export default function LoginPage() {
  return (
    <AuthCard title="Giriş Yap" subtitle="Hesabınızla devam edin; kayıtlı değilseniz hemen üye olabilirsiniz.">
      <LoginForm />
      <p className="mt-8 border-t border-border pt-5 text-sm text-ink-soft">
        Hesabınız yok mu?{" "}
        <Link href="/kayit" className="font-extrabold text-brand hover:underline">
          Kayıt olun
        </Link>
      </p>
    </AuthCard>
  );
}
