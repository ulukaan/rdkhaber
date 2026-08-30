import Link from "next/link";
import { Camera, FileText, Lock, Megaphone, Phone, Send } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { Container } from "@/components/ui/Container";
import { TipForm } from "@/components/forms/TipForm";
import { getSettings } from "@/lib/settings";
import { formatPhoneDisplay, whatsappUrl } from "@/lib/utils";
import { StaticPageHeader } from "@/components/pages/StaticDocument";

export const metadata = { title: "İhbar Hattı" };

export default async function TipLinePage() {
  const settings = await getSettings();
  const wa = whatsappUrl(settings.whatsappNumber);

  const channels = [
    settings.tipLinePhone
      ? {
          label: "Telefon",
          value: formatPhoneDisplay(settings.tipLinePhone),
          href: `tel:${settings.tipLinePhone.replace(/\s/g, "")}`,
          Icon: Phone,
        }
      : null,
    settings.tipLineEmail
      ? {
          label: "E-posta",
          value: settings.tipLineEmail,
          href: `mailto:${settings.tipLineEmail}`,
          Icon: Megaphone,
        }
      : null,
    settings.whatsappNumber && wa
      ? {
          label: "WhatsApp",
          value: formatPhoneDisplay(settings.whatsappNumber),
          href: wa,
          Icon: WhatsAppIcon,
        }
      : null,
  ].filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <>
      <StaticPageHeader
        title="İhbar Hattı"
        eyebrow="Gizlilik öncelikli"
        description="Kimliğinizi paylaşmadan ihbarda bulunabilirsiniz. Fotoğraf ve video ekleyebilirsiniz."
      />
      <Container className="py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div className="border border-border bg-white p-5 sm:p-7">
            <TipForm />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="border border-border bg-white p-5">
              <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink">
                <Lock className="h-4 w-4 text-brand" aria-hidden />
                Gizlilik
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                İletişim bilgisi vermek zorunda değilsiniz. Paylaşırsanız yalnızca haber
                masası görür; kamuya açık yayınlanmaz.
              </p>
            </div>

            <div className="border border-border bg-white p-5">
              <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink">
                <Camera className="h-4 w-4 text-brand" aria-hidden />
                Ne ekleyebilirsiniz?
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                <li>• Olay yeri fotoğrafları</li>
                <li>• Kısa video kayıtları</li>
                <li>• Belge ekran görüntüleri</li>
              </ul>
            </div>

            {channels.length > 0 ? (
              <div className="border border-border bg-white">
                <div className="border-b border-border bg-surface px-4 py-3">
                  <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink">
                    Doğrudan hatlar
                  </h2>
                </div>
                <ul className="divide-y divide-border">
                  {channels.map(({ label, value, href, Icon }) => (
                    <li key={label}>
                      <a
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="flex items-center gap-3 p-4 hover:bg-surface"
                      >
                        <Icon className="h-4 w-4 shrink-0 text-brand" aria-hidden />
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                            {label}
                          </p>
                          <p className="text-sm font-semibold text-ink">{value}</p>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <Link
              href="/haber-gonder"
              className="flex items-center gap-2 border border-border bg-surface px-4 py-3 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
            >
              <Send className="h-4 w-4 text-brand" aria-hidden />
              Açık kimlikle haber göndermek ister misiniz?
            </Link>
            <Link
              href="/iletisim"
              className="flex items-center gap-2 px-1 text-sm font-semibold text-ink-soft hover:text-brand"
            >
              <FileText className="h-4 w-4" aria-hidden />
              Genel iletişim formu
            </Link>
          </aside>
        </div>
      </Container>
    </>
  );
}
