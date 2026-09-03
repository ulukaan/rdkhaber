import Link from "next/link";
import { AuthCard } from "@/components/ui/AuthCard";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

export const metadata = { title: "Şifre Sıfırla" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token || token.length < 20) {
    return (
      <AuthCard title="Geçersiz bağlantı" subtitle="Şifre sıfırlama bağlantısı eksik veya hatalı.">
        <p className="text-sm leading-relaxed text-ink-soft">
          Lütfen{" "}
          <Link href="/sifremi-unuttum" className="font-extrabold text-brand hover:underline">
            şifremi unuttum
          </Link>{" "}
          sayfasından yeni bir bağlantı isteyin.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Yeni Şifre" subtitle="Hesabınız için güçlü bir şifre belirleyin.">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
