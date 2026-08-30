import { getSettings } from "@/lib/settings";

export async function getImapConfig() {
  const settings = await getSettings();
  const host = process.env.IMAP_HOST || "imap.hostinger.com";
  const user = process.env.IMAP_USER || process.env.SMTP_USER || settings.newsletterSmtpUser;
  const pass = process.env.IMAP_PASS || process.env.SMTP_PASS || settings.newsletterSmtpPass;
  const port = Number(process.env.IMAP_PORT || 993);
  const secure = process.env.IMAP_SECURE !== "0";

  return {
    configured: Boolean(host && user && pass),
    host,
    port,
    secure,
    user,
    pass,
    mailbox: process.env.IMAP_MAILBOX || "INBOX",
  };
}
