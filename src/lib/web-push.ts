import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";

function vapidConfigured() {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY?.trim() &&
      process.env.VAPID_PRIVATE_KEY?.trim() &&
      process.env.VAPID_SUBJECT?.trim(),
  );
}

function configureVapid() {
  if (!vapidConfigured()) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!.trim(),
    process.env.VAPID_PUBLIC_KEY!.trim(),
    process.env.VAPID_PRIVATE_KEY!.trim(),
  );
  return true;
}

export function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ?? process.env.VAPID_PUBLIC_KEY?.trim() ?? "";
}

export async function sendPushToAll(payload: {
  title: string;
  body: string;
  url?: string;
}) {
  if (!configureVapid()) return { sent: 0, failed: 0 };

  const subs = await prisma.pushSubscription.findMany({ take: 5000 });
  let sent = 0;
  let failed = 0;
  const data = JSON.stringify({
    title: payload.title.slice(0, 120),
    body: payload.body.slice(0, 240),
    url: payload.url ?? "/",
  });

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          data,
        );
        sent += 1;
      } catch {
        failed += 1;
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      }
    }),
  );

  return { sent, failed };
}

export async function sendBreakingNewsPush(article: { title: string; slug: string }) {
  const siteUrl = getSiteUrl();
  return sendPushToAll({
    title: "Son dakika",
    body: article.title,
    url: `${siteUrl}/haber/${article.slug}`,
  });
}
