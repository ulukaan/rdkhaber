import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const rows = await prisma.adSlot.findMany({ orderBy: { position: "asc" } });
for (const x of rows) {
  console.log(`${x.position}\t${x.active ? "ON" : "off"}\t${x.imageUrl}\t${x.name}`);
}
await prisma.$disconnect();
