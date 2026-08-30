import nodemailer from "nodemailer";
import { getSettings } from "@/lib/settings";
import { logOutboundMail } from "@/lib/mailbox-log";

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Giden kutusu kaynağı: system | compose | newsletter */
  logSource?: string;
};

export async function getMailConfig() {
  const settings = await getSettings();
  const host = process.env.SMTP_HOST || settings.newsletterSmtpHost;
  const user = process.env.SMTP_USER || settings.newsletterSmtpUser;
  const pass = process.env.SMTP_PASS || settings.newsletterSmtpPass;
  const port = Number(process.env.SMTP_PORT || settings.newsletterSmtpPort || 587);
  const secure =
    process.env.SMTP_SECURE === "1" ||
    settings.newsletterSmtpSecure === "1" ||
    port === 465;
  const fromEmail =
    process.env.SMTP_FROM || settings.newsletterFromEmail || settings.contactEmail || user;
  const fromName = settings.newsletterFromName || settings.siteName;

  return {
    configured: Boolean(host && fromEmail && (user ? pass : true)),
    host,
    port,
    secure,
    user,
    pass,
    fromEmail,
    fromName,
    from: fromName ? `"${fromName.replace(/"/g, "")}" <${fromEmail}>` : fromEmail,
  };
}

export async function sendMail(message: MailMessage) {
  const config = await getMailConfig();
  if (!config.configured || !config.host || !config.fromEmail) {
    throw new Error(
      "E-posta ayarı yok. Bülten > Ayarlar kısmına SMTP bilgilerinizi girin (Hostinger: smtp.hostinger.com, 587).",
    );
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user ? { user: config.user, pass: config.pass } : undefined,
  });

  await transporter.sendMail({
    from: config.from,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });

  await logOutboundMail({
    fromAddress: config.fromEmail,
    toAddress: message.to,
    subject: message.subject,
    bodyHtml: message.html,
    bodyText: message.text ?? null,
    source: message.logSource ?? "system",
  });
}
