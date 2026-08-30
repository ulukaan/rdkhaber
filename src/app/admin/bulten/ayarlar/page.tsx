import { PageHeader } from "@/components/admin/PageHeader";
import { NewsletterNav } from "@/components/admin/NewsletterNav";
import { NewsletterSmtpForm } from "@/components/admin/NewsletterSmtpForm";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "Bülten ayarları" };

export default async function NewsletterSettingsPage() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader
        title="Bülten ayarları"
        description="Kendi e-posta hesabınızla gönderin. Hostinger SMTP: smtp.hostinger.com"
      />
      <NewsletterNav pathname="/admin/bulten/ayarlar" />
      <NewsletterSmtpForm
        defaults={{
          newsletterFromName: settings.newsletterFromName,
          newsletterFromEmail: settings.newsletterFromEmail,
          newsletterSmtpHost: settings.newsletterSmtpHost,
          newsletterSmtpPort: settings.newsletterSmtpPort,
          newsletterSmtpUser: settings.newsletterSmtpUser,
          newsletterSmtpPass: settings.newsletterSmtpPass,
          newsletterSmtpSecure: settings.newsletterSmtpSecure,
        }}
      />
    </>
  );
}
