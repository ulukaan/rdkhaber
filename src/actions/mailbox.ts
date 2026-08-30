"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { composeMailSchema } from "@/lib/validation";
import { getMailConfig, sendMail } from "@/lib/mail";
import { syncInboundMailbox } from "@/lib/imap-mail";
import { getEmailBranding, escapeHtml, wrapCorporateEmailHtml } from "@/lib/email-template";
import { getImapConfig } from "@/lib/imap-config";

function refresh() {
  revalidatePath("/admin/eposta");
  revalidatePath("/admin/eposta/giden");
}

export async function syncMailboxAction() {
  await requireRole(["ADMIN"]);
  try {
    const result = await syncInboundMailbox(80);
    refresh();
    return {
      success: true as const,
      message: `${result.imported} yeni e-posta alındı (son ${result.total} kontrol edildi).`,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Senkronizasyon başarısız." };
  }
}

export async function getMailboxStatusAction() {
  await requireRole(["ADMIN"]);
  const [mail, imap] = await Promise.all([getMailConfig(), getImapConfig()]);
  return {
    smtpConfigured: mail.configured,
    imapConfigured: imap.configured,
    fromEmail: mail.fromEmail,
  };
}

export async function sendComposeMailAction(raw: Record<string, unknown>) {
  await requireRole(["ADMIN"]);
  const parsed = composeMailSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const mail = await getMailConfig();
  if (!mail.configured) {
    return { error: "SMTP ayarları yapılandırılmamış. Bülten > Ayarlar bölümünü kontrol edin." };
  }

  const { to, subject, body } = parsed.data;
  const branding = await getEmailBranding();
  const html = wrapCorporateEmailHtml({
    ...branding,
    preheader: body.slice(0, 120),
    eyebrow: "E-posta",
    title: subject,
    contentHtml: `<p style="margin:0;white-space:pre-wrap;">${escapeHtml(body)}</p>`,
    footerNote: `${escapeHtml(branding.siteName)} üzerinden gönderildi.`,
  });

  try {
    await sendMail({
      to,
      subject,
      html,
      text: body,
      logSource: "compose",
    });
    refresh();
    return { success: true as const };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gönderilemedi." };
  }
}

export async function markMailboxReadAction(id: string, isRead = true) {
  await requireRole(["ADMIN"]);
  await prisma.mailboxMessage.update({
    where: { id },
    data: { isRead },
  });
  refresh();
  revalidatePath(`/admin/eposta/${id}`);
}

export async function deleteMailboxMessageAction(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.mailboxMessage.delete({ where: { id } });
  refresh();
}
