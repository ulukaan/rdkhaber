import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { lookupCodes } from "@/lib/ad-slots";

export const getActiveAd = cache(function getActiveAd(code: string) {
  return prisma.adSlot.findFirst({
    where: { active: true, position: { in: lookupCodes(code) } },
    orderBy: { createdAt: "desc" },
  });
});

export function getAllAds() {
  return prisma.adSlot.findMany({ orderBy: { createdAt: "desc" } });
}
