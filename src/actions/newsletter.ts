"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth-guard";
import {
  newsletterCampaignSchema,
  newsletterSmtpSchema,
  newsletterSubscribeSchema,
} from "@/lib/validation";
import { getMailConfig, sendMail } from "@/lib/mail";
import { setSettings, getSettings } from "@/lib/settings";
import { encryptSecret } from "@/lib/secret-crypto";
import {
  buildNewsDigestHtml,
  parseSubscriberImport,
  sanitizeNewsletterHtml,
  wrapNewsletterHtml,
  buildSingleArticleNewsletterHtml,
} from "@/lib/newsletter";
import { getEmailBranding } from "@/lib/email-template";
import { getSiteUrl } from "@/lib/site-url";

function refresh() {
  revalidatePath("/admin/bulten");
  revalidatePath("/admin/bulten/aboneler");
  revalidatePath("/admin/bulten/ayarlar");
}

function newToken() {
  return randomBytes(24).toString("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function subscribeNewsletterAction(raw: Record<string, unknown>) {
  if (typeof raw.website === "string" && raw.website.trim()) {
    return { success: true };
  }
  const { headers } = await import("next/headers");
  const { clientIp, rateLimit } = await import("@/lib/rate-limit");
  const h = await headers();
  const limited = rateLimit(`newsletter:${clientIp(h)}`, { limit: 10, windowMs: 60 * 60_000 });
  if (!limited.ok) {
    return { error: `Çok fazla deneme. ${limited.retryAfterSec} sn sonra tekrar deneyin.` };
  }
  const parsed = newsletterSubscribeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  const email = normalizeEmail(parsed.data.email);
  const name = parsed.data.name?.trim() || null;
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) {
    if (existing.status !== "ACTIVE") {
      await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { status: "ACTIVE", name: name || existing.name },
      });
    }
    return { success: true };
  }
  await prisma.newsletterSubscriber.create({
    data: { email, name, status: "ACTIVE", source: "site", token: newToken() },
  });
  refresh();
  return { success: true };
}

export async function unsubscribeNewsletterAction(token: string) {
  const row = await prisma.newsletterSubscriber.findUnique({ where: { token } });
  if (!row) return { error: "Abonelik bulunamadı." };
  await prisma.newsletterSubscriber.update({
    where: { id: row.id },
    data: { status: "UNSUBSCRIBED" },
  });
  refresh();
  return { success: true as const };
}

export async function setMemberNewsletterAction(subscribe: boolean) {
  const session = await requireAuth();
  const email = normalizeEmail(session.user.email ?? "");
  if (!email) return { error: "Hesap e-postası bulunamadı." };

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (subscribe) {
    if (existing) {
      await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          name: session.user.name || existing.name,
          source: existing.source || "uye",
        },
      });
    } else {
      await prisma.newsletterSubscriber.create({
        data: {
          email,
          name: session.user.name ?? null,
          status: "ACTIVE",
          source: "uye",
          token: newToken(),
        },
      });
    }
  } else if (existing && existing.status === "ACTIVE") {
    await prisma.newsletterSubscriber.update({
      where: { id: existing.id },
      data: { status: "UNSUBSCRIBED" },
    });
  }

  refresh();
  revalidatePath("/hesabim");
  revalidatePath("/hesabim/bulten");
  return { success: true as const };
}

export async function unsubscribeNewsletterByEmailAction(email: string) {
  const { headers } = await import("next/headers");
  const { clientIp, rateLimit } = await import("@/lib/rate-limit");
  const h = await headers();
  const limited = rateLimit(`newsletter-unsub:${clientIp(h)}`, {
    limit: 5,
    windowMs: 60 * 60_000,
  });
  if (!limited.ok) {
    return { error: `Çok fazla deneme. ${limited.retryAfterSec} sn sonra tekrar deneyin.` };
  }

  const normalized = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { error: "Geçerli bir e-posta adresi girin." };
  }

  const row = await prisma.newsletterSubscriber.findUnique({ where: { email: normalized } });
  if (row && row.status === "ACTIVE") {
    const settings = await getSettings();
    const siteUrl = getSiteUrl();
    const confirmUrl = `${siteUrl}/bulten/cikis?token=${row.token}`;
    try {
      await sendMail({
        to: normalized,
        subject: `${settings.siteName} — Abonelik iptali onayı`,
        html: `<p>Bülten aboneliğinizi iptal etmek için aşağıdaki bağlantıya tıklayın:</p><p><a href="${confirmUrl}">Abonelikten çık</a></p><p>Bu talebi siz yapmadıysanız bu e-postayı yok sayın.</p>`,
        logSource: "newsletter",
      });
    } catch {
      return { error: "Onay e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin." };
    }
  }

  return {
    success: true as const,
    message:
      "Talebiniz alındı. Kayıtlı bir adres ise onay bağlantısı e-postanıza gönderildi.",
  };
}

async function unsubscribeUrlForEmail(email: string) {
  const siteUrl = getSiteUrl();
  const row = await prisma.newsletterSubscriber.findUnique({ where: { email: normalizeEmail(email) } });
  if (row?.token) return `${siteUrl}/bulten/cikis?token=${row.token}`;
  return `${siteUrl}/bulten/cikis`;
}

export async function addNewsletterSubscriberAction(raw: Record<string, unknown>) {
  await requireRole(["ADMIN"]);
  const parsed = newsletterSubscribeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  const email = normalizeEmail(parsed.data.email);
  const name = parsed.data.name?.trim() || null;
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) {
    await prisma.newsletterSubscriber.update({
      where: { id: existing.id },
      data: { status: "ACTIVE", name: name || existing.name, source: existing.source },
    });
  } else {
    await prisma.newsletterSubscriber.create({
      data: { email, name, status: "ACTIVE", source: "panel", token: newToken() },
    });
  }
  refresh();
  return { success: true };
}

export async function importNewsletterSubscribersAction(raw: string) {
  await requireRole(["ADMIN"]);
  const rows = parseSubscriberImport(raw);
  if (rows.length === 0) return { error: "Geçerli e-posta bulunamadı. Her satır: eposta, ad" };
  let added = 0;
  for (const row of rows) {
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: row.email } });
    if (existing) {
      await prisma.newsletterSubscriber.update({
        where: { id: existing.id },
        data: { status: "ACTIVE", name: row.name || existing.name },
      });
    } else {
      await prisma.newsletterSubscriber.create({
        data: {
          email: row.email,
          name: row.name || null,
          status: "ACTIVE",
          source: "import",
          token: newToken(),
        },
      });
      added += 1;
    }
  }
  refresh();
  return { success: true, added, total: rows.length };
}

export async function deleteNewsletterSubscriberAction(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.newsletterSubscriber.delete({ where: { id } });
  refresh();
}

export async function createNewsletterCampaignAction(raw: Record<string, unknown>) {
  await requireRole(["ADMIN"]);
  const parsed = newsletterCampaignSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  const campaign = await prisma.newsletterCampaign.create({
    data: {
      subject: parsed.data.subject.trim(),
      preheader: parsed.data.preheader?.trim() || null,
      content: sanitizeNewsletterHtml(parsed.data.content),
      status: "DRAFT",
    },
  });
  refresh();
  return { success: true, id: campaign.id };
}

export async function updateNewsletterCampaignAction(id: string, raw: Record<string, unknown>) {
  await requireRole(["ADMIN"]);
  const parsed = newsletterCampaignSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  const current = await prisma.newsletterCampaign.findUnique({ where: { id } });
  if (!current) return { error: "Bülten bulunamadı." };
  if (current.status === "SENT") return { error: "Gönderilmiş bülten düzenlenemez." };
  await prisma.newsletterCampaign.update({
    where: { id },
    data: {
      subject: parsed.data.subject.trim(),
      preheader: parsed.data.preheader?.trim() || null,
      content: sanitizeNewsletterHtml(parsed.data.content),
    },
  });
  refresh();
  return { success: true };
}

export async function fillCampaignFromNewsAction() {
  await requireRole(["ADMIN"]);
  const content = await buildNewsDigestHtml(8);
  return { success: true, content };
}

export async function fillCampaignFromArticleAction(articleId: string) {
  await requireRole(["ADMIN"]);
  const built = await buildSingleArticleNewsletterHtml(articleId);
  if (!built) return { error: "Haber bulunamadı veya yayında değil." };
  return {
    success: true as const,
    content: built.html,
    subject: built.subject,
    preheader: built.preheader,
  };
}

export async function sendArticleNewsletterAction(input: {
  articleId: string;
  subscriberIds?: string[];
  sendToAll?: boolean;
}) {
  await requireRole(["ADMIN"]);
  const config = await getMailConfig();
  if (!config.configured) {
    return { error: "Önce SMTP ayarlarını kaydedin." };
  }

  const built = await buildSingleArticleNewsletterHtml(input.articleId);
  if (!built) return { error: "Haber bulunamadı veya yayında değil." };

  let subscribers;
  if (input.sendToAll) {
    subscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: "ACTIVE" },
    });
  } else {
    const ids = (input.subscriberIds ?? []).filter(Boolean);
    if (ids.length === 0) {
      return { error: "En az bir abone seçin veya tüm abonelere gönderin." };
    }
    subscribers = await prisma.newsletterSubscriber.findMany({
      where: { id: { in: ids }, status: "ACTIVE" },
    });
  }

  if (subscribers.length === 0) {
    return { error: "Gönderilecek aktif abone yok." };
  }

  const branding = await getEmailBranding();
  const siteUrl = getSiteUrl();
  let sentCount = 0;
  let failCount = 0;
  let lastError: string | null = null;

  for (const sub of subscribers) {
    const html = wrapNewsletterHtml({
      ...branding,
      content: built.html,
      preheader: built.preheader,
      unsubscribeUrl: `${siteUrl}/bulten/cikis?token=${sub.token}`,
    });
    try {
      await sendMail({ to: sub.email, subject: built.subject, html, logSource: "newsletter" });
      sentCount += 1;
    } catch (err) {
      failCount += 1;
      lastError = err instanceof Error ? err.message : "Gönderim hatası";
    }
  }

  refresh();
  return {
    success: true as const,
    sentCount,
    failCount,
    error: lastError ?? undefined,
  };
}

export async function deleteNewsletterCampaignAction(id: string) {
  await requireRole(["ADMIN"]);
  await prisma.newsletterCampaign.delete({ where: { id } });
  refresh();
}

export async function saveNewsletterSmtpAction(raw: Record<string, unknown>) {
  await requireRole(["ADMIN"]);
  const parsed = newsletterSmtpSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }
  const current = await getSettings();
  const pass = parsed.data.newsletterSmtpPass?.trim()
    ? (() => {
        try {
          return encryptSecret(parsed.data.newsletterSmtpPass);
        } catch {
          return null;
        }
      })()
    : current.newsletterSmtpPass;
  if (parsed.data.newsletterSmtpPass?.trim() && !pass) {
    return { error: "SMTP şifresi kaydedilemedi. AUTH_SECRET (min. 32 karakter) tanımlı olmalı." };
  }
  await setSettings({
    newsletterFromName: parsed.data.newsletterFromName ?? "",
    newsletterFromEmail: parsed.data.newsletterFromEmail ?? "",
    newsletterSmtpHost: parsed.data.newsletterSmtpHost ?? "",
    newsletterSmtpPort: parsed.data.newsletterSmtpPort || "587",
    newsletterSmtpUser: parsed.data.newsletterSmtpUser ?? "",
    newsletterSmtpPass: pass ?? "",
    newsletterSmtpSecure: parsed.data.newsletterSmtpSecure === "1" ? "1" : "0",
  });
  refresh();
  return { success: true };
}

export async function sendNewsletterTestAction(to: string, campaignId?: string) {
  await requireRole(["ADMIN"]);
  const email = normalizeEmail(to);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Test için geçerli bir e-posta girin." };
  }
  const settings = await getSettings();
  const branding = await getEmailBranding();
  const campaign = campaignId
    ? await prisma.newsletterCampaign.findUnique({ where: { id: campaignId } })
    : null;
  const content = campaign?.content ?? "<p>Bu bir test bültenidir. SMTP ayarlarınız çalışıyor.</p>";
  const subject = campaign ? `[Test] ${campaign.subject}` : `[Test] ${settings.siteName} bülteni`;
  const html = wrapNewsletterHtml({
    ...branding,
    content,
    preheader: campaign?.preheader ?? "Test gönderimi",
    unsubscribeUrl: await unsubscribeUrlForEmail(email),
  });
  try {
    await sendMail({ to: email, subject, html, logSource: "newsletter" });
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gönderilemedi" };
  }
}

export async function sendNewsletterCampaignAction(id: string) {
  await requireRole(["ADMIN"]);
  const config = await getMailConfig();
  if (!config.configured) {
    return { error: "Önce SMTP ayarlarını kaydedin." };
  }

  const campaign = await prisma.newsletterCampaign.findUnique({ where: { id } });
  if (!campaign) return { error: "Bülten bulunamadı." };
  if (campaign.status === "SENT") return { error: "Bu bülten zaten gönderilmiş." };

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { status: "ACTIVE" },
  });
  if (subscribers.length === 0) return { error: "Aktif abone yok." };

  const branding = await getEmailBranding();
  const siteUrl = getSiteUrl();
  await prisma.newsletterCampaign.update({
    where: { id },
    data: { status: "SENDING", lastError: null },
  });

  let sentCount = 0;
  let failCount = 0;
  let lastError: string | null = null;

  for (const sub of subscribers) {
    const html = wrapNewsletterHtml({
      ...branding,
      content: campaign.content,
      preheader: campaign.preheader ?? undefined,
      unsubscribeUrl: `${siteUrl}/bulten/cikis?token=${sub.token}`,
    });
    try {
      await sendMail({
      to: sub.email,
      subject: campaign.subject,
      html,
      logSource: "newsletter",
    });
      sentCount += 1;
    } catch (err) {
      failCount += 1;
      lastError = err instanceof Error ? err.message : "Gönderim hatası";
    }
  }

  await prisma.newsletterCampaign.update({
    where: { id },
    data: {
      status: sentCount > 0 ? "SENT" : "DRAFT",
      sentAt: sentCount > 0 ? new Date() : null,
      sentCount,
      failCount,
      lastError,
    },
  });
  refresh();
  return { success: true, sentCount, failCount, error: lastError ?? undefined };
}
