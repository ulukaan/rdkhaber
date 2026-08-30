import { Mail, Phone, Megaphone, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { Container } from "@/components/ui/Container";
import { getSettings } from "@/lib/settings";
import { ContactForm } from "@/components/forms/ContactForm";
import { formatPhoneDisplay, whatsappUrl } from "@/lib/utils";

export const metadata = { title: "İletişim" };

export default async function ContactPage() {
  const settings = await getSettings();
  const wa = whatsappUrl(settings.whatsappNumber);

  const items = [
    settings.contactAddress
      ? { label: "Adres", value: settings.contactAddress, Icon: MapPin }
      : null,
    settings.contactEmail
      ? {
          label: "E-posta",
          value: settings.contactEmail,
          Icon: Mail,
          href: `mailto:${settings.contactEmail}`,
        }
      : null,
    settings.contactPhone
      ? {
          label: "Telefon",
          value: formatPhoneDisplay(settings.contactPhone),
          Icon: Phone,
          href: `tel:${settings.contactPhone.replace(/\s/g, "")}`,
        }
      : null,
    settings.tipLinePhone
      ? {
          label: "İhbar Hattı Telefon",
          value: formatPhoneDisplay(settings.tipLinePhone),
          Icon: Phone,
          href: `tel:${settings.tipLinePhone.replace(/\s/g, "")}`,
        }
      : null,
    settings.tipLineEmail
      ? {
          label: "İhbar Hattı E-posta",
          value: settings.tipLineEmail,
          Icon: Megaphone,
          href: `mailto:${settings.tipLineEmail}`,
        }
      : null,
    settings.whatsappNumber
      ? {
          label: "WhatsApp Hattı",
          value: formatPhoneDisplay(settings.whatsappNumber),
          Icon: WhatsAppIcon,
          href: wa || undefined,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-extrabold text-ink">İletişim</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Haber masamıza ulaşın. Formdaki mesajlar doğrudan haber ekibine iletilir.
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="flex flex-col divide-y divide-border border border-border">
            {items.map(({ label, value, Icon, href }) => {
              const inner = (
                <>
                  <Icon className="h-5 w-5 shrink-0 text-brand" />
                  <div>
                    <p className="text-xs text-ink-soft">{label}</p>
                    <p className="font-semibold text-ink">{value}</p>
                  </div>
                </>
              );
              if (href) {
                return (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-3 p-4 hover:bg-surface"
                  >
                    {inner}
                  </a>
                );
              }
              return (
                <div key={label} className="flex items-start gap-3 p-4">
                  {inner}
                </div>
              );
            })}
          </div>

          <div>
            <h2 className="mb-4 text-lg font-extrabold text-ink">Bize yazın</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </Container>
  );
}
