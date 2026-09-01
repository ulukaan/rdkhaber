"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const subSchema = z.object({
  endpoint: z.string().url().max(500),
  keys: z.object({
    p256dh: z.string().min(10),
    auth: z.string().min(10),
  }),
});

export async function savePushSubscriptionAction(raw: unknown) {
  const h = await headers();
  const limited = await rateLimit(`push-sub:${clientIp(h)}`, {
    limit: 20,
    windowMs: 60 * 60_000,
  });
  if (!limited.ok) {
    return { error: `Çok fazla istek. ${limited.retryAfterSec} sn sonra tekrar deneyin.` };
  }

  const session = await auth();
  const parsed = subSchema.safeParse(raw);
  if (!parsed.success) return { error: "Geçersiz abonelik." };

  await prisma.pushSubscription.upsert({
    where: { endpoint: parsed.data.endpoint },
    update: {
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      userId: session?.user?.id ?? null,
    },
    create: {
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      userId: session?.user?.id ?? null,
    },
  });

  return { success: true as const };
}

export async function removePushSubscriptionAction(endpoint: string) {
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  revalidatePath("/");
  return { success: true as const };
}
