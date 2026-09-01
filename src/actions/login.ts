"use server";

import { headers } from "next/headers";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/captcha";
import { createLoginChallenge } from "@/lib/security-tokens";
import { openTotpSecret, verifyTotpCode } from "@/lib/totp";
import { writeAuditLog } from "@/lib/audit-log";

export async function loginAction(input: {
  email: string;
  password: string;
  captchaToken?: string;
}) {
  const h = await headers();
  const ip = clientIp(h);
  const limited = await rateLimit(`login:${input.email.toLowerCase()}`, {
    limit: 5,
    windowMs: 15 * 60_000,
  });
  if (!limited.ok) {
    return { error: `Çok fazla deneme. ${limited.retryAfterSec} sn sonra tekrar deneyin.` };
  }

  const captchaOk = await verifyTurnstileToken(input.captchaToken ?? "", ip);
  if (!captchaOk) return { error: "Güvenlik doğrulaması başarısız." };

  const user = await prisma.user.findUnique({ where: { email: input.email.trim() } });
  if (!user || !user.active) return { error: "E-posta veya şifre hatalı." };

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) return { error: "E-posta veya şifre hatalı." };

  if (user.totpEnabled && user.totpSecret) {
    return {
      requires2fa: true as const,
      challenge: createLoginChallenge(user.id),
      userId: user.id,
    };
  }

  await writeAuditLog({ userId: user.id, action: "auth.login" });
  await signIn("credentials", {
    email: user.email,
    password: input.password,
    totpVerified: "0",
    redirectTo: "/post-giris",
  });
}

export async function verify2faLoginAction(input: {
  userId: string;
  challenge: string;
  code: string;
  email: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user?.active || !user.totpEnabled || !user.totpSecret) {
    return { error: "Doğrulama başarısız." };
  }

  const secret = openTotpSecret(user.totpSecret);
  if (!verifyTotpCode(secret, input.code)) {
    return { error: "Doğrulama kodu hatalı." };
  }

  const { verifyLoginChallenge } = await import("@/lib/security-tokens");
  if (!verifyLoginChallenge(input.challenge, user.id)) {
    return { error: "Oturum süresi doldu. Tekrar giriş yapın." };
  }

  await writeAuditLog({ userId: user.id, action: "auth.login.2fa" });
  await signIn("credentials", {
    email: input.email,
    password: input.password,
    totpVerified: "1",
    redirectTo: "/post-giris",
  });
}
