import { getSettings } from "@/lib/settings";
import { AuthHeader } from "@/components/layout/AuthHeader";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[linear-gradient(180deg,#fff5f5_0%,#ffffff_40%,#f7f7f8_100%)]">
      <AuthHeader siteName={settings.siteName} logoUrl={settings.logoUrl || undefined} />
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t border-brand/10 bg-white/70 py-5 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-brand">{settings.siteName}</span>
      </footer>
    </div>
  );
}
