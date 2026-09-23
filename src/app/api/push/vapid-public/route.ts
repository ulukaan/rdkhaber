import { NextResponse } from "next/server";
import { getVapidPublicKey, isWebPushEnabled } from "@/lib/web-push";

/** İstemci abonelik butonu için public VAPID (NEXT_PUBLIC yoksa sunucu anahtarı). */
export async function GET() {
  const publicKey = getVapidPublicKey();
  return NextResponse.json({
    enabled: isWebPushEnabled(),
    publicKey: publicKey || null,
  });
}
