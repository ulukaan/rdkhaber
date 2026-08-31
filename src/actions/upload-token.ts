"use server";

import { headers } from "next/headers";
import { auth } from "@/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createPublicUploadToken } from "@/lib/upload-token";

/** Haber gönder / ihbar formları için kısa ömürlü yükleme jetonu. */
export async function issuePublicUploadTokenAction(honeypot?: string) {
  if (typeof honeypot === "string" && honeypot.trim()) {
    return { error: "İstek reddedildi." };
  }

  const h = await headers();
  const ip = clientIp(h);
  const session = await auth();
  const key = session?.user ? `upload-token:user:${session.user.id}` : `upload-token:ip:${ip}`;
  const limited = rateLimit(key, {
    limit: session?.user ? 20 : 8,
    windowMs: 60 * 60_000,
  });
  if (!limited.ok) {
    return { error: `Çok fazla istek. ${limited.retryAfterSec} sn sonra tekrar deneyin.` };
  }

  try {
    return { token: createPublicUploadToken(ip) };
  } catch {
    return { error: "Yükleme jetonu oluşturulamadı." };
  }
}
