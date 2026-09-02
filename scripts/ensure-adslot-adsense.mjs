import { PrismaClient } from "@prisma/client";
import { hasDatabaseUrl, skipMessage } from "./ensure-db-utils.mjs";

const prisma = new PrismaClient();

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    table,
    column,
  );
  return Number(rows[0]?.c ?? 0) > 0;
}

async function indexExists(table, index) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    table,
    index,
  );
  return Number(rows[0]?.c ?? 0) > 0;
}

async function main() {
  if (!hasDatabaseUrl()) {
    skipMessage("ensure-adslot-adsense");
    return;
  }

  if (!(await columnExists("AdSlot", "kind"))) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `AdSlot` ADD COLUMN `kind` TEXT NOT NULL DEFAULT 'BANNER'",
    );
  }
  if (!(await columnExists("AdSlot", "adsenseSlot"))) {
    await prisma.$executeRawUnsafe("ALTER TABLE `AdSlot` ADD COLUMN `adsenseSlot` TEXT NULL");
  }
  if (!(await columnExists("AdSlot", "adsenseLayout"))) {
    await prisma.$executeRawUnsafe("ALTER TABLE `AdSlot` ADD COLUMN `adsenseLayout` TEXT NULL");
  }
  if (!(await columnExists("AdSlot", "adsenseFormat"))) {
    await prisma.$executeRawUnsafe("ALTER TABLE `AdSlot` ADD COLUMN `adsenseFormat` TEXT NULL");
  }
  if (!(await indexExists("AdSlot", "AdSlot_kind_active_idx"))) {
    await prisma.$executeRawUnsafe(
      "CREATE INDEX `AdSlot_kind_active_idx` ON `AdSlot`(`kind`, `active`)",
    );
  }

  console.log("AdSlot AdSense columns ready");
}

main()
  .catch((err) => {
    console.error("ensure-adslot-adsense skipped:", err?.message ?? err);
  })
  .finally(() => prisma.$disconnect());
