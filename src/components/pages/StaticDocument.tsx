import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { formatPhoneDisplay, whatsappUrl } from "@/lib/utils";

export type ParsedSection = {
  title?: string;
  body: string;
};

export function parsePageContent(content: string): {
  lead: string[];
  sections: ParsedSection[];
} {
  const blocks = content
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const lead: string[] = [];
  const sections: ParsedSection[] = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    const first = lines[0];
    const rest = lines.slice(1).join("\n");
    const looksLikeTitle =
      lines.length >= 2 &&
      first.length <= 72 &&
      !first.startsWith("•") &&
      !first.startsWith("-") &&
      !/^[0-9]+[.)]/.test(first) &&
      !/[.!?]$/.test(first);

    if (looksLikeTitle) {
      sections.push({ title: first, body: rest });
      continue;
    }

    if (sections.length === 0) {
      lead.push(lines.join("\n"));
    } else {
      sections.push({ body: lines.join("\n") });
    }
  }

  return { lead, sections };
}

function BodyText({ text }: { text: string }) {
  const lines = text.split("\n").filter(Boolean);
  const hasBullets = lines.every((l) => l.startsWith("•") || l.startsWith("-"));

  if (hasBullets) {
    return (
      <ul className="mt-2 space-y-2 text-[15px] leading-7 text-ink/85">
        {lines.map((line) => (
          <li key={line} className="flex gap-2">
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
            <span>{line.replace(/^[•\-]\s*/, "")}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-ink/85">{text}</p>
  );
}

const LEGAL_NAV = [
  { href: "/sayfa/kunye", label: "Künye" },
  { href: "/sayfa/gizlilik", label: "Gizlilik" },
  { href: "/sayfa/kvkk", label: "KVKK" },
  { href: "/cerezler", label: "Çerezler" },
  { href: "/sayfa/kullanim-kosullari", label: "Kullanım Şartları" },
  { href: "/iletisim", label: "İletişim" },
];

export function StaticPageHeader({
  title,
  eyebrow,
  description,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
}) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:py-10">
        {eyebrow ? (
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-3xl font-black tracking-tight text-ink sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}

export function LegalNav({ currentSlug }: { currentSlug: string }) {
  return (
    <nav
      className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-6 text-sm"
      aria-label="Kurumsal sayfalar"
    >
      {LEGAL_NAV.map((item) => {
        const active = item.href === `/sayfa/${currentSlug}`;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "font-extrabold text-brand"
                : "font-semibold text-ink-soft hover:text-brand"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DocumentSections({
  lead,
  sections,
}: {
  lead: string[];
  sections: ParsedSection[];
}) {
  return (
    <div className="space-y-8">
      {lead.length > 0 ? (
        <div className="space-y-3 border-l-4 border-brand pl-4">
          {lead.map((p) => (
            <p key={p.slice(0, 40)} className="text-base leading-7 text-ink sm:text-[1.05rem]">
              {p}
            </p>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4">
        {sections.map((section, i) => (
          <section
            key={`${section.title ?? "s"}-${i}`}
            className="border border-border bg-white p-5 sm:p-6"
          >
            {section.title ? (
              <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-ink">
                <span className="h-4 w-1 shrink-0 bg-brand" aria-hidden />
                {section.title}
              </h2>
            ) : null}
            <BodyText text={section.body} />
          </section>
        ))}
      </div>
    </div>
  );
}

type ContactSettings = {
  siteName: string;
  siteSlogan: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  tipLinePhone: string;
  tipLineEmail: string;
  whatsappNumber: string;
};

export function KunyeLayout({
  title,
  content,
  settings,
}: {
  title: string;
  content: string;
  settings: ContactSettings;
}) {
  const { lead, sections } = parsePageContent(content);
  const wa = whatsappUrl(settings.whatsappNumber);

  const contacts = [
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
    settings.whatsappNumber
      ? {
          label: "WhatsApp",
          value: formatPhoneDisplay(settings.whatsappNumber),
          Icon: WhatsAppIcon,
          href: wa || undefined,
        }
      : null,
    settings.tipLinePhone
      ? {
          label: "İhbar hattı",
          value: formatPhoneDisplay(settings.tipLinePhone),
          Icon: Phone,
          href: `tel:${settings.tipLinePhone.replace(/\s/g, "")}`,
        }
      : null,
  ].filter((c): c is NonNullable<typeof c> => Boolean(c));

  const description =
    lead.find((p) => p.length > 40) ||
    settings.siteSlogan ||
    "Yerel ve ulusal habercilik";

  return (
    <>
      <StaticPageHeader
        title={title}
        eyebrow="Yayın kimliği"
        description={description}
      />
      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
          <div>
            <div className="mb-6 border border-border bg-white p-5 sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Yayın</p>
              <p className="mt-2 text-2xl font-black tracking-tight text-ink">{settings.siteName}</p>
              {settings.siteSlogan ? (
                <p className="mt-1 text-sm text-ink-soft">{settings.siteSlogan}</p>
              ) : null}
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                    Yayın türü
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">İnternet haberciliği</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                    Mevzuat
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">5187 sayılı Basın Kanunu</dd>
                </div>
              </dl>
            </div>

            <DocumentSections lead={[]} sections={sections.filter((s) => s.title !== "Yayın türü")} />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="border border-border bg-white">
              <div className="border-b border-border bg-surface px-4 py-3">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-ink">İletişim</h2>
              </div>
              <ul className="divide-y divide-border">
                {contacts.length === 0 ? (
                  <li className="p-4 text-sm text-ink-soft">
                    İletişim bilgileri ayarlardan eklenebilir.{" "}
                    <Link href="/iletisim" className="font-semibold text-brand hover:underline">
                      İletişim sayfası
                    </Link>
                  </li>
                ) : (
                  contacts.map(({ label, value, Icon, href }) => {
                    const row = (
                      <>
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">
                            {label}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
                        </div>
                      </>
                    );
                    return (
                      <li key={label}>
                        {href ? (
                          <a
                            href={href}
                            target={href.startsWith("http") ? "_blank" : undefined}
                            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="flex gap-3 p-4 transition-colors hover:bg-surface"
                          >
                            {row}
                          </a>
                        ) : (
                          <div className="flex gap-3 p-4">{row}</div>
                        )}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
            <Link
              href="/iletisim"
              className="flex h-11 items-center justify-center bg-brand text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Bize yazın
            </Link>
          </aside>
        </div>

        <div className="mt-10">
          <LegalNav currentSlug="kunye" />
        </div>
      </div>
    </>
  );
}

export function LegalDocumentLayout({
  slug,
  title,
  content,
}: {
  slug: string;
  title: string;
  content: string;
}) {
  const { lead, sections } = parsePageContent(content);
  const description = lead[0];

  return (
    <>
      <StaticPageHeader title={title} eyebrow="Kurumsal" description={description} />
      <div className="mx-auto max-w-[860px] px-4 py-8 sm:py-10">
        <DocumentSections lead={lead.slice(1)} sections={sections} />
        <div className="mt-10">
          <LegalNav currentSlug={slug} />
        </div>
      </div>
    </>
  );
}
