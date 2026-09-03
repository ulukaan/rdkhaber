import { requireAuth } from "@/lib/auth-guard";
import { Header } from "@/components/layout/Header";
import { HeaderAdBanner } from "@/components/layout/HeaderAdBanner";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloatButton } from "@/components/layout/WhatsAppFloatButton";
import { BackToTopButton } from "@/components/layout/BackToTopButton";
import { Container } from "@/components/ui/Container";
import { AccountNav } from "@/components/account/AccountNav";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const settings = await getSettings();

  return (
    <div className="flex min-h-svh w-full max-w-[100vw] flex-col overflow-x-hidden">
      <HeaderAdBanner />
      <Header />
      <main className="flex-1 overflow-x-hidden bg-surface">
        <Container className="py-6 sm:py-8">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
            <AccountNav role={session.user.role} name={session.user.name} />
            <div className="min-w-0 max-w-full">{children}</div>
          </div>
        </Container>
      </main>
      <Footer />
      <BackToTopButton />
      <WhatsAppFloatButton whatsappNumber={settings.whatsappNumber} />
    </div>
  );
}
