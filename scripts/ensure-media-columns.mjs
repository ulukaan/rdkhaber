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
    skipMessage("ensure-media-columns");
    return;
  }

  if (!(await columnExists("Media", "contentHash"))) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `Media` ADD COLUMN `contentHash` VARCHAR(64) NULL",
    );
  }
  if (!(await indexExists("Media", "Media_contentHash_idx"))) {
    await prisma.$executeRawUnsafe(
      "CREATE INDEX `Media_contentHash_idx` ON `Media`(`contentHash`)",
    );
  }

  console.log("Media columns ready");
}

main()
  .catch((err) => {
    console.error("ensure-media-columns skipped:", err?.message ?? err);
  })
  .finally(() => prisma.$disconnect());
