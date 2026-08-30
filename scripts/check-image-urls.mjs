import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const rows = await prisma.$queryRawUnsafe(
  "SELECT title, coverImageUrl FROM Article WHERE coverImageUrl IS NOT NULL AND coverImageUrl != '' LIMIT 8",
);
for (const r of rows) {
  console.log("---");
  console.log(r.title?.slice?.(0, 50) ?? r.title);
  console.log(r.coverImageUrl);
}
const settings = await prisma.$queryRawUnsafe(
  "SELECT `key`, `value` FROM Setting WHERE `key` IN ('logoUrl','faviconUrl','siteName')",
);
console.log("SETTINGS", settings);
await prisma.$disconnect();
