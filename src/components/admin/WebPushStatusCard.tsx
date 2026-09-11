import { isWebPushEnabled, getVapidPublicKey } from "@/lib/web-push";
import { prisma } from "@/lib/prisma";

/** Admin güvenlik sayfasında web push durumu. */
export async function WebPushStatusCard() {
  const enabled = isWebPushEnabled();
  const hasPublic = Boolean(getVapidPublicKey());
  const count = enabled
    ? await prisma.pushSubscription.count()
    : 0;

  return (
    <div className="mt-6 rounded-xl border border-border bg-white p-4">
      <h2 className="text-sm font-extrabold text-ink">Web Push (son dakika)</h2>
      <p className="mt-1 text-sm text-ink-soft">
        {enabled
          ? `Aktif · ${count} abone. Son dakika işaretli haberlerde bildirim gider.`
          : "Kapalı — VAPID anahtarları tanımlı değil."}
      </p>
      {!enabled ? (
        <pre className="mt-3 overflow-x-auto rounded-lg bg-surface p-3 text-[11px] leading-relaxed text-ink-soft">
{`# Sunucuda / Hostinger env:
node scripts/generate-vapid-keys.mjs
# üretilen satırları .env'e ekleyin, sonra yeniden build/restart`}
        </pre>
      ) : null}
      {enabled && !hasPublic ? (
        <p className="mt-2 text-xs font-semibold text-amber-700">
          Uyarı: public key istemciye ulaşmıyor; NEXT_PUBLIC_VAPID_PUBLIC_KEY veya VAPID_PUBLIC_KEY kontrol edin.
        </p>
      ) : null}
    </div>
  );
}
