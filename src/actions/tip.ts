"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { contactSchema, tipSchema } from "@/lib/validation";
import { requireRole } from "@/lib/auth-guard";
import type { SubmissionStatus } from "@prisma/client";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSettings } from "@/lib/settings";
import { getSiteUrl } from "@/lib/site-url";
import { sendPanelNotificationEmail } from "@/lib/notify-email";
import { parseAttachmentUrls, serializeAttachmentUrls } from "@/lib/attachments";

export async function submitTipAction(values: {
  message: string;
  contactInfo?: string;
  attachmentUrl?: string;
}) {
  const h = await headers();
  const limited = rateLimit(`tip:${clientIp(h)}`, { limit: 8, windowMs: 60 * 60_000 });
  if (!limited.ok) {
    return { error: `Çok fazla ihbar. ${limited.retryAfterSec} sn sonra tekrar deneyin.` };
  }

  const parsed = tipSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  await prisma.tip.create({
    data: {
      message: parsed.data.message.slice(0, 5000),
      contactInfo: parsed.data.contactInfo || null,
      attachmentUrl: serializeAttachmentUrls(parseAttachmentUrls(parsed.data.attachmentUrl)) ?? null,
    },
  });

  const settings = await getSettings();
  const siteUrl = getSiteUrl();
  await sendPanelNotificationEmail({
    to: settings.tipLineEmail || settings.contactEmail,
    subject: `${settings.siteName} — Yeni ihbar`,
    eyebrow: "İhbar hattı",
    title: "Yeni ihbar mesajı",
    intro: "Sitedeki ihbar formu üzerinden yeni bir mesaj alındı.",
    fields: [
      {
        label: "İletişim",
        value: parsed.data.contactInfo?.trim() || "Belirtilmedi",
      },
      ...(parsed.data.attachmentUrl
        ? [{ label: "Ek dosya", value: parseAttachmentUrls(parsed.data.attachmentUrl).join(", ") }]
        : []),
      {
        label: "Mesaj",
        value: parsed.data.message.slice(0, 5000),
        multiline: true,
      },
    ],
    panelHref: `${siteUrl}/admin/ihbarlar`,
  });

  return { success: true };
}

export async function submitContactAction(values: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const h = await headers();
  const limited = rateLimit(`contact:${clientIp(h)}`, { limit: 8, windowMs: 60 * 60_000 });
  if (!limited.ok) {
    return { error: `Çok fazla mesaj. ${limited.retryAfterSec} sn sonra tekrar deneyin.` };
  }

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const { name, email, phone, message } = parsed.data;

  await prisma.tip.create({
    data: {
      message: `[İletişim] ${name}\n\n${message}`,
      contactInfo: `${email}${phone?.trim() ? `\nTelefon: ${phone.trim()}` : ""}`.trim(),
    },
  });

  const settings = await getSettings();
  const siteUrl = getSiteUrl();
  await sendPanelNotificationEmail({
    to: settings.contactEmail,
    subject: `${settings.siteName} — İletişim formu`,
    eyebrow: "İletişim",
    title: "Yeni iletişim mesajı",
    intro: "Sitedeki iletişim formu üzerinden yeni bir mesaj alındı.",
    fields: [
      { label: "Gönderen", value: name },
      { label: "E-posta", value: email },
      ...(phone?.trim() ? [{ label: "Telefon", value: phone.trim() }] : []),
      { label: "Mesaj", value: message, multiline: true },
    ],
    panelHref: `${siteUrl}/admin/ihbarlar`,
  });

  return { success: true };
}

export async function setTipStatusAction(id: string, status: SubmissionStatus) {
  await requireRole(["ADMIN", "EDITOR"]);
  await prisma.tip.update({ where: { id }, data: { status } });
  revalidatePath("/admin/ihbarlar");
  revalidatePath("/editor/ihbarlar");
}

export async function deleteTipAction(id: string) {
  await requireRole(["ADMIN", "EDITOR"]);
  await prisma.tip.delete({ where: { id } });
  revalidatePath("/admin/ihbarlar");
  revalidatePath("/editor/ihbarlar");
}
