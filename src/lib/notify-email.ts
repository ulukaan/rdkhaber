import { sendMail } from "@/lib/mail";
import {
  buildNotificationEmailHtml,
  escapeHtml,
  getEmailBranding,
  htmlToPlainText,
  wrapCorporateEmailHtml,
  type NotificationField,
} from "@/lib/email-template";

export type SubmitterConfirmationKind = "news" | "tip";

const CONFIRMATION_COPY: Record<
  SubmitterConfirmationKind,
  {
    subject: (siteName: string) => string;
    preheader: string;
    eyebrow: string;
    title: string;
    body: (siteName: string) => string;
    footerNote: string;
  }
> = {
  news: {
    subject: (siteName) => `${siteName} — Haberiniz alındı`,
    preheader: "Haber başvurunuz editörlerimize ulaştı.",
    eyebrow: "Haber gönder",
    title: "Haberiniz başarıyla alındı",
    body: (siteName) =>
      `${siteName} haber gönder formu üzerinden ilettiğiniz içerik editörlerimize ulaştı. Başvurunuz incelendikten sonra uygun görülürse sitede yayınlanacaktır. Uygun bulunmayan içerikler hakkında ayrıca bilgilendirme yapılmayabilir.`,
    footerNote:
      "Bu e-posta, haber başvurunuzun tarafımıza ulaştığını bildirmek için otomatik gönderilmiştir.",
  },
  tip: {
    subject: (siteName) => `${siteName} — İhbarınız alındı`,
    preheader: "İhbarınız değerlendirme sürecine alındı.",
    eyebrow: "İhbar hattı",
    title: "İhbarınız başarıyla alındı",
    body: (siteName) =>
      `${siteName} ihbar hattı üzerinden ilettiğiniz mesaj tarafımıza ulaştı. Ekibimiz en kısa sürede değerlendirecektir. Kimliğiniz gizli tutulur; yalnızca doğrulama gerektiğinde sizinle iletişime geçilebilir.`,
    footerNote:
      "Bu e-posta, ihbarınızın tarafımıza ulaştığını bildirmek için otomatik gönderilmiştir.",
  },
};

export async function sendSubmitterConfirmationEmail({
  to,
  kind,
  recipientName,
  referenceTitle,
  siteUrl,
}: {
  to: string;
  kind: SubmitterConfirmationKind;
  recipientName?: string | null;
  referenceTitle?: string | null;
  siteUrl: string;
}) {
  const address = to.trim().toLowerCase();
  if (!address) return;

  try {
    const branding = await getEmailBranding();
    const copy = CONFIRMATION_COPY[kind];
    const greeting = recipientName?.trim()
      ? `Merhaba ${escapeHtml(recipientName.trim())},`
      : "Merhaba,";

    const referenceBlock =
      kind === "news" && referenceTitle?.trim()
        ? `<p style="margin:16px 0 0;padding:12px 14px;background:#f8f9fb;border-left:3px solid ${branding.brandColor};font-size:14px;color:#374151;">
            <strong style="color:#14181f;">Başvuru başlığı:</strong><br />
            ${escapeHtml(referenceTitle.trim().slice(0, 300))}
          </p>`
        : "";

    const html = wrapCorporateEmailHtml({
      ...branding,
      preheader: copy.preheader,
      eyebrow: copy.eyebrow,
      title: copy.title,
      contentHtml: `
        <p style="margin:0 0 14px;">${greeting}</p>
        <p style="margin:0 0 14px;">${copy.body(branding.siteName)}</p>
        ${referenceBlock}
        <p style="margin:16px 0 0;padding:12px 14px;background:#f8f9fb;font-size:13px;color:#6b7280;">
          Sorularınız için: <a href="mailto:${branding.contactEmail}" style="color:${branding.brandColor};text-decoration:none;font-weight:600;">${branding.contactEmail}</a>
        </p>
      `,
      cta: { label: "Siteye dön", href: siteUrl },
      footerNote: copy.footerNote,
    });

    await sendMail({
      to: address,
      subject: copy.subject(branding.siteName),
      html,
      text: htmlToPlainText(html),
      logSource: "system",
    });
  } catch {
    // SMTP yoksa form kaydı yine de başarılı sayılır.
  }
}

export async function sendPanelNotificationEmail({
  to,
  subject,
  eyebrow,
  title,
  intro,
  fields,
  preheader,
  panelHref,
}: {
  to: string;
  subject: string;
  eyebrow: string;
  title: string;
  intro: string;
  fields: NotificationField[];
  preheader?: string;
  panelHref?: string;
}) {
  if (!to.trim()) return;
  try {
    const branding = await getEmailBranding();
    const html = buildNotificationEmailHtml(branding, {
      eyebrow,
      title,
      intro,
      fields,
      preheader,
      panelHref,
    });
    await sendMail({
      to: to.trim(),
      subject,
      html,
      text: htmlToPlainText(html),
    });
  } catch {
    // SMTP yoksa kayıt yine de panelde kalır.
  }
}
