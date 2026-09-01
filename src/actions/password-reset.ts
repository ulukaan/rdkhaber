"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getMailConfig, sendMail } from "@/lib/mail";
import { getSiteUrl } from "@/lib/site-url";
import { getSettings } from "@/lib/settings";
import { getEmailBranding, wrapCorporateEmailHtml } from "@/lib/email-template";

const TOKEN_TTL_MS = 60 * 60_000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordResetAction(values: { email: string }) {
  const h = await headers();
  const limited = await rateLimit(`forgot:${clientIp(h)}`, { limit: 5, windowMs: 60 * 60_000 });
  if (!limited.ok) {
    return { error: `Çok fazla deneme. ${limited.retryAfterSec} sn sonra tekrar deneyin.` };
  }

  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const genericOk = {
    ok: true as const,
    message:
      "Eğer bu e-posta kayıtlıysa şifre sıfırlama bağlantısı gönderildi. Gelen kutunuzu (ve spam klasörünü) kontrol edin.",
  };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) return genericOk;

  const mail = await getMailConfig();
  if (!mail.configured) {
    return {
      error:
        "Şu an e-posta gönderimi yapılandırılamadı. Lütfen site yönetimiyle iletişime geçin veya daha sonra tekrar deneyin.",
    };
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await prisma.passwordResetToken.create({
    data: { tokenHash, userId: user.id, expiresAt },
  });

  const settings = await getSettings();
  const branding = await getEmailBranding();
  const resetUrl = `${getSiteUrl()}/sifre-sifirla?token=${encodeURIComponent(token)}`;

  const html = wrapCorporateEmailHtml({
    ...branding,
    preheader: "Şifre sıfırlama bağlantınız 1 saat geçerlidir.",
    eyebrow: "Hesap güvenliği",
    title: `Merhaba, ${user.name}`,
    contentHtml: `
      <p style="margin:0 0 14px;">Hesabınız için şifre sıfırlama talebi aldık. Yeni şifrenizi belirlemek için aşağıdaki butona tıklayın.</p>
      <p style="margin:0;padding:12px 14px;background:#f8f9fb;border-left:3px solid ${branding.brandColor};font-size:13px;color:#6b7280;">
        Bu bağlantı <strong style="color:#14181f;">1 saat</strong> geçerlidir.
      </p>
      <p style="margin:16px 0 0;font-size:13px;color:#9ca3af;">Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz; hesabınız güvendedir.</p>
    `,
    cta: { label: "Şifremi sıfırla", href: resetUrl },
    footerNote: "Güvenliğiniz için şifre sıfırlama bağlantısını kimseyle paylaşmayın.",
  });

  try {
    await sendMail({
      to: user.email,
      subject: `${settings.siteName} — Şifre sıfırlama`,
      html,
      text: `Şifre sıfırlama bağlantısı (1 saat geçerli): ${resetUrl}`,
    });
  } catch (err) {
    console.error("[requestPasswordResetAction]", err);
    return { error: "E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin." };
  }

  return genericOk;
}

export async function resetPasswordAction(values: {
  token: string;
  password: string;
  passwordConfirm: string;
}) {
  const h = await headers();
  const limited = await rateLimit(`reset:${clientIp(h)}`, { limit: 10, windowMs: 60 * 60_000 });
  if (!limited.ok) {
    return { error: `Çok fazla deneme. ${limited.retryAfterSec} sn sonra tekrar deneyin.` };
  }

  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const tokenHash = hashToken(parsed.data.token);
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, active: true } } },
  });

  if (!row || row.expiresAt.getTime() < Date.now() || !row.user.active) {
    return { error: "Bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir sıfırlama isteği oluşturun." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.deleteMany({ where: { userId: row.userId } }),
  ]);

  return { ok: true as const, message: "Şifreniz güncellendi. Şimdi giriş yapabilirsiniz." };
}
