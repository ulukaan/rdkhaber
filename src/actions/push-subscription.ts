"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const subSchema = z.object({
  endpoint: z.string().url().max(500),
  keys: z.object({
    p256dh: z.string().min(10),
    auth: z.string().min(10),
  }),
});

export async function savePushSubscriptionAction(raw: unknown) {
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
