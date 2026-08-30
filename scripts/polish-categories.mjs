import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

const districts = [
  "duzce",
  "akcakoca",
  "cilimli",
  "cumayeri",
  "golyaka",
  "gumusova",
  "kaynasli",
  "yigilca",
  "beykoy",
  "bolu",
];

async function main() {
  const bolge = await p.category.findUnique({ where: { slug: "bolge" } });
  const bolgeKat = await p.category.findUnique({
    where: { slug: "bolge-kategorileri" },
  });
  const siyPart = await p.category.findUnique({
    where: { slug: "siyasi-partiler" },
  });

  if (bolge) {
    for (const slug of districts) {
      await p.category.updateMany({
        where: { slug },
        data: { parentId: bolge.id },
      });
    }
  }

  if (bolgeKat) {
    await p.category.update({
      where: { id: bolgeKat.id },
      data: {
        name: "Bölge Haberleri",
        headingH1: "Bölge Haberleri",
        color: "#0f766e",
        parentId: bolge?.id ?? null,
      },
    });
  }

  if (siyPart) {
    await p.category.update({
      where: { id: siyPart.id },
      data: {
        name: "Siyasi Partiler",
        headingH1: "Siyasi Partiler",
      },
    });
  }

  await p.category.updateMany({
    where: { slug: "foto-galeri" },
    data: { photoGallery: true, color: "#7c3aed" },
  });
  await p.category.updateMany({
    where: { slug: "video-galeri" },
    data: { videoGallery: true, color: "#9333ea" },
  });
  await p.category.updateMany({ data: { description: null } });

  const cats = await p.category.findMany({
    orderBy: { order: "asc" },
    select: {
      slug: true,
      name: true,
      color: true,
      parent: { select: { slug: true } },
      _count: { select: { articles: true } },
    },
  });
  for (const c of cats) {
    console.log(
      `${(c.color || "-").padEnd(8)} /${c.slug.padEnd(34)} ${c.name.padEnd(28)} parent=${c.parent?.slug || "-"} n=${c._count.articles}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
