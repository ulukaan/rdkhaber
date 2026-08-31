import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { lookupCodes } from "@/lib/ad-slots";
import { CACHE_TAGS } from "@/lib/cache-tags";

export const getActiveAd = cache((code: string) =>
  unstable_cache(
    async () =>
      prisma.adSlot.findFirst({
        where: { active: true, position: { in: lookupCodes(code) } },
        orderBy: { createdAt: "desc" },
      }),
    ["active-ad", code],
    { revalidate: 120, tags: [CACHE_TAGS.ads] },
  )(),
);

export function getAllAds() {
  return prisma.adSlot.findMany({ orderBy: { createdAt: "desc" } });
}
