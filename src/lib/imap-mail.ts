import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { getImapConfig } from "@/lib/imap-config";
import { logInboundMail } from "@/lib/mailbox-log";

export async function syncInboundMailbox(limit = 50) {
  const config = await getImapConfig();
  if (!config.configured) {
    throw new Error(
      "IMAP ayarı yok. Bülten > Ayarlar’daki SMTP bilgilerini kullanın veya IMAP_USER / IMAP_PASS ortam değişkenlerini tanımlayın.",
    );
  }

  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user!,
      pass: config.pass!,
    },
    logger: false,
  });

  await client.connect();
  const lock = await client.getMailboxLock(config.mailbox);
  let imported = 0;

  try {
    const mailbox = client.mailbox;
    const total =
      mailbox && typeof mailbox === "object" && "exists" in mailbox ? mailbox.exists : 0;
    if (total === 0) return { imported, total: 0 };

    const start = Math.max(1, total - limit + 1);
    const range = `${start}:${total}`;

    for await (const message of client.fetch(range, {
      uid: true,
      envelope: true,
      source: true,
    })) {
      if (!message.source) continue;

      const parsed = await simpleParser(message.source);
      const fromAddress =
        parsed.from?.text ||
        message.envelope?.from?.[0]?.address ||
        message.envelope?.from?.[0]?.name ||
        "bilinmiyor";
      const toAddress =
        parsed.to?.text ||
        message.envelope?.to?.[0]?.address ||
        config.user ||
        "";
      const externalId = parsed.messageId?.trim() || `uid:${message.uid}`;
      const subject = parsed.subject?.trim() || "(Konu yok)";
      const bodyHtml = typeof parsed.html === "string" ? parsed.html : null;
      const bodyText = parsed.text?.trim() || null;

      const created = await logInboundMail({
        externalId,
        fromAddress,
        toAddress,
        subject,
        bodyHtml,
        bodyText,
      });
      if (created) imported += 1;
    }

    return { imported, total };
  } finally {
    lock.release();
    await client.logout();
  }
}
