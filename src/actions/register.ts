"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validation";
import { signIn } from "@/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/captcha";

export async function registerAction(values: {
  name: string;
  email: string;
  password: string;
  captchaToken?: string;
  website?: string;
}) {
  if (values.website?.trim()) {
    return { error: "Geçersiz form." };
  }

  const h = await headers();
  const ip = clientIp(h);
  const limited = await rateLimit(`register:${ip}`, { limit: 5, windowMs: 60 * 60_000 });
  if (!limited.ok) {
    return { error: `Çok fazla kayıt denemesi. ${limited.retryAfterSec} sn sonra tekrar deneyin.` };
  }

  const captchaOk = await verifyTurnstileToken(values.captchaToken ?? "", ip);
  if (!captchaOk) return { error: "Güvenlik doğrulaması başarısız." };

  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return {
      ok: true as const,
      message:
        "Kayıt isteği alındı. E-posta adresinizle giriş yapmayı deneyin; hesabınız yoksa yöneticiyle iletişime geçin.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "USER",
    },
  });

  await signIn("credentials", {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: "/post-giris",
  });
}
