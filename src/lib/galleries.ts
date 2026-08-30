import { prisma } from "@/lib/prisma";

export function getGalleries(take = 6) {
  return prisma.gallery.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
    },
  });
}

export function getGalleryBySlug(slug: string) {
  return prisma.gallery.findUnique({
    where: { slug },
    include: { images: { orderBy: { order: "asc" } } },
  });
}
