import Link from "next/link";
import { AuthCard } from "@/components/ui/AuthCard";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata = { title: "Giriş Yap" };

export default function LoginPage() {
  return (
    <AuthCard title="Giriş Yap" subtitle="Hesabınıza giriş yaparak devam edin.">
      <LoginForm />
      <p className="mt-6 border-t border-border/80 pt-5 text-center text-sm text-ink-soft">
        Hesabınız yok mu?{" "}
        <Link href="/kayit" className="font-semibold text-brand hover:underline">
          Kayıt olun
        </Link>
      </p>
    </AuthCard>
  );
}
