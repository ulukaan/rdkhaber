import { prisma } from "@/lib/prisma";

export type MailboxDirection = "INBOUND" | "OUTBOUND";

export async function logOutboundMail({
  fromAddress,
  toAddress,
  subject,
  bodyHtml,
  bodyText,
  source,
  externalId,
}: {
  fromAddress: string;
  toAddress: string;
  subject: string;
  bodyHtml?: string | null;
  bodyText?: string | null;
  source: string;
  externalId?: string | null;
}) {
  try {
    await prisma.mailboxMessage.create({
      data: {
        direction: "OUTBOUND",
        externalId: externalId ?? null,
        fromAddress,
        toAddress,
        subject,
        bodyHtml: bodyHtml ?? null,
        bodyText: bodyText ?? null,
        source,
        isRead: true,
      },
    });
  } catch {
    // Kayıt başarısız olsa da gönderim devam etsin.
  }
}

export async function logInboundMail({
  externalId,
  fromAddress,
  toAddress,
  subject,
  bodyHtml,
  bodyText,
  source = "imap",
}: {
  externalId: string;
  fromAddress: string;
  toAddress: string;
  subject: string;
  bodyHtml?: string | null;
  bodyText?: string | null;
  source?: string;
}) {
  const existing = await prisma.mailboxMessage.findFirst({
    where: { direction: "INBOUND", externalId },
  });
  if (existing) return false;

  await prisma.mailboxMessage.create({
    data: {
      direction: "INBOUND",
      externalId,
      fromAddress,
      toAddress,
      subject,
      bodyHtml: bodyHtml ?? null,
      bodyText: bodyText ?? null,
      source,
    },
  });
  return true;
}
