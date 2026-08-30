import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Slot → kreatif (gerçek boyut):
 * 009/036 kule     160x600  → skyscraper
 * 069 anamanşet yan 320x480 → portrait
 * 151/128/133       728x90  → banner
 * 150               970x250 → wide
 * 300               320x100 → strip
 * 070               320x250 → near-square
 * 077               336x280 → modal
 */
const ADS = [
  {
    position: "009",
    name: "QRlamenu — Sağ kule",
    imageUrl: "/reklam/qrlamenu-skyscraper.png",
    targetUrl: "https://www.qrlamenu.com",
  },
  {
    position: "036",
    name: "TarifPark — Sol kule",
    imageUrl: "/reklam/tarifpark-160x600.png",
    targetUrl: "https://tarifpark.com/",
  },
  {
    position: "069",
    name: "TarifPark — Anamanşet yan / sağ sütun",
    imageUrl: "/reklam/tarifpark-320x480.png",
    targetUrl: "https://tarifpark.com/",
  },
  {
    position: "151",
    name: "TarifPark — Manşet altı",
    imageUrl: "/reklam/tarifpark-728x90.png",
    targetUrl: "https://tarifpark.com/",
  },
  {
    position: "128",
    name: "TarifPark — Haber başı",
    imageUrl: "/reklam/tarifpark-728x90.png",
    targetUrl: "https://tarifpark.com/",
  },
  {
    position: "133",
    name: "TarifPark — Haber yan alt",
    imageUrl: "/reklam/tarifpark-728x90.png",
    targetUrl: "https://tarifpark.com/",
  },
  {
    position: "150",
    name: "TarifPark — Kategori altı",
    imageUrl: "/reklam/tarifpark-970x250.png",
    targetUrl: "https://tarifpark.com/",
  },
  {
    position: "300",
    name: "TarifPark — Sağ sütun şerit",
    imageUrl: "/reklam/tarifpark-320x100.png",
    targetUrl: "https://tarifpark.com/",
  },
  {
    position: "070",
    name: "TarifPark — Mobil manşet arası",
    imageUrl: "/reklam/tarifpark-320x250.png",
    targetUrl: "https://tarifpark.com/",
  },
  {
    position: "077",
    name: "TarifPark — Açılış modal",
    imageUrl: "/reklam/tarifpark-336x280.png",
    targetUrl: "https://tarifpark.com/",
    active: false,
  },
];

for (const ad of ADS) {
  const data = {
    name: ad.name,
    imageUrl: ad.imageUrl,
    targetUrl: ad.targetUrl,
    active: ad.active ?? true,
  };
  await prisma.adSlot.upsert({
    where: { position: ad.position },
    update: data,
    create: { position: ad.position, ...data },
  });
  console.log(`${data.active ? "●" : "○"} ${ad.position} ${ad.imageUrl}`);
}

await prisma.$disconnect();
