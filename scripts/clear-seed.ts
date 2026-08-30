import { PrismaClient } from "@prisma/client";
import { unlink } from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

const SEED_GALLERY_SLUGS = [
  "hafta-sonu-kacamaklari-sakli-rotalar",
  "mimovic-dev-macta-sahne-aldi",
  "super-lig-gol-kralligi-yarisi",
];

const SEED_TAG_SLUGS = [
  "son-dakika",
  "turkiye",
  "merkez-bankasi",
  "enflasyon",
  "yapay-zeka",
  "super-lig",
  "sampiyonlar-ligi",
  "enerji",
  "uzay",
  "yazilim",
  "futbol",
  "borsa",
];

const SEED_EMPTY_CATS = ["teknoloji", "kultur-sanat", "roportaj", "dunya"];

const SEED_AD_CODES = [
  "152", "151", "150", "069", "068", "300", "036", "009", "128", "138", "1003", "153", "077",
];

async function main() {
  const ads = await prisma.adSlot.findMany();
  const seedAds = ads.filter(
    (a) =>
      a.name.startsWith("Örnek") ||
      a.targetUrl.includes("example.com") ||
      a.imageUrl.includes("/reklam/ornek-") ||
      a.imageUrl.includes("ornek-") ||
      a.imageUrl.startsWith("file://") ||
      a.targetUrl === "qsq",
  );
  if (seedAds.length) {
    await prisma.adSlot.deleteMany({ where: { id: { in: seedAds.map((a) => a.id) } } });
  }

  for (const code of SEED_AD_CODES) {
    const file = path.join(process.cwd(), "public", "reklam", `ornek-${code}.svg`);
    await unlink(file).catch(() => {});
  }

  const galleries = await prisma.gallery.deleteMany({
    where: { slug: { in: SEED_GALLERY_SLUGS } },
  });

  const fakeArticles = await prisma.article.deleteMany({
    where: {
      OR: [
        { coverImageUrl: { contains: "images.unsplash.com" } },
        { sourceUrl: null },
        { NOT: { sourceUrl: { contains: "duzceradikal.com" } } },
      ],
    },
  });

  await prisma.tip.deleteMany();
  await prisma.newsSubmission.deleteMany();

  const unusedCats = await prisma.category.findMany({
    where: { slug: { in: SEED_EMPTY_CATS } },
    include: { _count: { select: { articles: true } } },
  });
  const emptyCatIds = unusedCats.filter((c) => c._count.articles === 0).map((c) => c.id);
  if (emptyCatIds.length) {
    await prisma.category.deleteMany({ where: { id: { in: emptyCatIds } } });
  }

  const unusedTags = await prisma.tag.findMany({
    include: { _count: { select: { articles: true } } },
  });
  const seedTagIds = unusedTags
    .filter((t) => t._count.articles === 0 && SEED_TAG_SLUGS.includes(t.slug))
    .map((t) => t.id);
  if (seedTagIds.length) {
    await prisma.tag.deleteMany({ where: { id: { in: seedTagIds } } });
  }

  const leftoverTags = unusedTags.filter((t) => t._count.articles === 0 && !SEED_TAG_SLUGS.includes(t.slug));
  if (leftoverTags.length) {
    await prisma.tag.deleteMany({ where: { id: { in: leftoverTags.map((t) => t.id) } } });
  }

  const settings = await prisma.setting.findMany();
  const seedSettingKeys = new Set([
    "facebookUrl",
    "twitterUrl",
    "instagramUrl",
    "youtubeUrl",
  ]);
  for (const s of settings) {
    if (seedSettingKeys.has(s.key) && s.value.includes("rdkhaber")) {
      await prisma.setting.update({ where: { key: s.key }, data: { value: "" } });
    }
    if (s.key === "siteName" && s.value === "RD Haber") {
      await prisma.setting.update({ where: { key: "siteName" }, data: { value: "Düzce Radikal" } });
    }
  }

  const remaining = {
    articles: await prisma.article.count(),
    ads: await prisma.adSlot.count(),
    galleries: await prisma.gallery.count(),
    tips: await prisma.tip.count(),
    submissions: await prisma.newsSubmission.count(),
    categories: await prisma.category.count(),
    tags: await prisma.tag.count(),
  };

  const leftoverAds = await prisma.adSlot.findMany({
    select: { position: true, name: true, imageUrl: true, targetUrl: true },
  });
  console.log("Silinen örnek reklam:", seedAds.length);
  console.log("Silinen galeri:", galleries.count);
  console.log("Silinen örnek haber:", fakeArticles.count);
  console.log("Silinen boş seed kategori:", emptyCatIds.length);
  console.log("Kalan reklamlar:", leftoverAds);
  console.log("Kalan:", remaining);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
