import { sendMail } from "@/lib/mail";
import {
  buildNotificationEmailHtml,
  getEmailBranding,
  htmlToPlainText,
  type NotificationField,
} from "@/lib/email-template";

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
