import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const rows = await prisma.$queryRawUnsafe("SHOW TABLES");
  console.log("tables:", rows);

  try {
    const mig = await prisma.$queryRawUnsafe(
      "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 25",
    );
    console.log("migrations:", mig);
  } catch (e) {
    console.log("migrations table:", e.message);
  }

  for (const table of [
    "Party",
    "ElectionRound",
    "ElectionRuleSet",
    "ResultSnapshot",
    "GeoUnit",
    "SeatAllocation",
  ]) {
    try {
      await prisma.$queryRawUnsafe(`SELECT COUNT(*) as c FROM \`${table}\``);
      console.log(`${table}: exists`);
    } catch {
      console.log(`${table}: missing`);
    }
  }
} finally {
  await prisma.$disconnect();
}
