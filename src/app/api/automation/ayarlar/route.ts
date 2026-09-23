import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  assertAutomationAuth,
  automationUnauthorized,
  jsonError,
  jsonOk,
} from "@/lib/automation-api";

/** Otomasyon için güvenli, salt-okunur ayar anahtarları */
const ALLOWED_KEYS = new Set([
  "siteName",
  "siteSlogan",
  "contactEmail",
  "contactPhone",
  "contactAddress",
  "facebookUrl",
  "twitterUrl",
  "instagramUrl",
  "youtubeUrl",
  "whatsappNumber",
  "tipLinePhone",
  "tipLineEmail",
]);

export async function GET(request: NextRequest) {
  if (!assertAutomationAuth(request)) return automationUnauthorized();

  try {
    const key = request.nextUrl.searchParams.get("key")?.trim();
    if (key) {
      if (!ALLOWED_KEYS.has(key)) {
        return jsonError("Bu ayar anahtarı otomasyon API üzerinden okunamaz.", 403);
      }
      const row = await prisma.setting.findUnique({ where: { key } });
      return jsonOk({ key, value: row?.value ?? null });
    }

    const rows = await prisma.setting.findMany({
      where: { key: { in: [...ALLOWED_KEYS] } },
      select: { key: true, value: true },
    });

    const settings: Record<string, string | null> = {};
    for (const k of ALLOWED_KEYS) settings[k] = null;
    for (const row of rows) settings[row.key] = row.value;

    return jsonOk({ settings });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Ayar okuma hatası", 500);
  }
}
