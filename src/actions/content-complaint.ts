"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSettings } from "@/lib/settings";
import { sendPanelNotificationEmail } from "@/lib/notify-email";
import { getSiteUrl } from "@/lib/site-url";
import { notifyAdmins } from "@/lib/notifications";

const complaintSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(254),
  phone: z.string().max(40).optional(),
  articleUrl: z.string().max(500).optional(),
  message: z.string().min(20).max(5000),
});

export async function submitContentComplaintAction(values: z.infer<typeof complaintSchema>) {
  const h = await headers();
  const limited = rateLimit(`complaint:${clientIp(h)}`, { limit: 5, windowMs: 60 * 60_000 });
  if (!limited.ok) {
    return { error: `Çok fazla başvuru. ${limited.retryAfterSec} sn sonra tekrar deneyin.` };
  }

  const parsed = complaintSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  await prisma.contentComplaint.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      articleUrl: parsed.data.articleUrl || null,
      message: parsed.data.message,
    },
  });

  const settings = await getSettings();
  await sendPanelNotificationEmail({
    to: settings.contactEmail,
    subject: `${settings.siteName} — İçerik şikayeti`,
    eyebrow: "Şikayet",
    title: "Yeni içerik şikayeti",
    intro: "Sitedeki şikayet formu üzerinden yeni bir başvuru alındı.",
    fields: [
      { label: "Gönderen", value: parsed.data.name },
      { label: "E-posta", value: parsed.data.email },
      { label: "Haber URL", value: parsed.data.articleUrl || "—" },
      { label: "Mesaj", value: parsed.data.message, multiline: true },
    ],
    panelHref: `${getSiteUrl()}/admin/sikayetlar`,
  });

  await notifyAdmins({
    title: "İçerik şikayeti",
    body: parsed.data.message.slice(0, 160),
    href: "/admin/sikayetlar",
  });

  return { success: true as const };
}

export async function resolveComplaintAction(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.contentComplaint.update({
    where: { id },
    data: { status: "RESOLVED", resolvedAt: new Date() },
  });
  revalidatePath("/admin/sikayetlar");
  return { success: true as const };
}

export async function listComplaintsAction() {
  await requireRole(["ADMIN"]);
  return prisma.contentComplaint.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}
