import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { isBotUserAgent } from "@/lib/bot-ua";

const COOKIE_PREFIX = "rdk_v_";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 saat

function cookieName(articleId: string) {
  // Cookie isimleri için güvenli kısa anahtar
  const safe = articleId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 40);
  return `${COOKIE_PREFIX}${safe || "x"}`;
}

/**
 * Haberi bir kez (24s / ziyaretçi) sayar. Bot UA ve boş UA atlanır.
 * @returns true = sayaç arttı
 */
export async function trackArticleView(articleId: string): Promise<{ counted: boolean; reason?: string }> {
  if (!articleId.trim()) return { counted: false, reason: "invalid" };

  const h = await headers();
  const ua = h.get("user-agent");
  if (isBotUserAgent(ua)) return { counted: false, reason: "bot" };

  const jar = await cookies();
  const name = cookieName(articleId);
  if (jar.get(name)?.value === "1") {
    return { counted: false, reason: "deduped" };
  }

  await prisma.article.update({
    where: { id: articleId },
    data: { viewCount: { increment: 1 } },
  });

  jar.set(name, "1", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return { counted: true };
}
