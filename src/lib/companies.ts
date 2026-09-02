import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type FeaturedCompany = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  websiteUrl: string;
  category: string;
};

export const getFeaturedCompanies = cache(async (limit = 12): Promise<FeaturedCompany[]> => {
  // Prisma client henüz generate edilmediyse sayfayı düşürme
  if (!prisma.company?.findMany) return [];
  return prisma.company.findMany({
    where: { active: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      websiteUrl: true,
      category: true,
    },
  });
});
