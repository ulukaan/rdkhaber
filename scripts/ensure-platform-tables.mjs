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

async function main() {
  if (!hasDatabaseUrl()) {
    skipMessage("ensure-platform-tables");
    return;
  }

  if (!(await columnExists("User", "totpSecret"))) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `User` ADD COLUMN `totpSecret` VARCHAR(191) NULL",
    );
  }
  if (!(await columnExists("User", "totpEnabled"))) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `User` ADD COLUMN `totpEnabled` BOOLEAN NOT NULL DEFAULT false",
    );
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`AuditLog\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`userId\` VARCHAR(191) NULL,
      \`action\` VARCHAR(191) NOT NULL,
      \`entity\` VARCHAR(191) NULL,
      \`entityId\` VARCHAR(191) NULL,
      \`meta\` TEXT NULL,
      \`ip\` VARCHAR(191) NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      INDEX \`AuditLog_createdAt_idx\`(\`createdAt\`),
      INDEX \`AuditLog_userId_idx\`(\`userId\`),
      INDEX \`AuditLog_action_idx\`(\`action\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`ArticleRevision\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`articleId\` VARCHAR(191) NOT NULL,
      \`userId\` VARCHAR(191) NOT NULL,
      \`snapshot\` LONGTEXT NOT NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      INDEX \`ArticleRevision_articleId_createdAt_idx\`(\`articleId\`, \`createdAt\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`Notification\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`userId\` VARCHAR(191) NOT NULL,
      \`title\` VARCHAR(191) NOT NULL,
      \`body\` TEXT NOT NULL,
      \`href\` VARCHAR(191) NULL,
      \`readAt\` DATETIME(3) NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      INDEX \`Notification_userId_readAt_idx\`(\`userId\`, \`readAt\`),
      INDEX \`Notification_userId_createdAt_idx\`(\`userId\`, \`createdAt\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  console.log("Platform tables ready");
}

main()
  .catch((err) => {
    console.error("ensure-platform-tables skipped:", err?.message ?? err);
  })
  .finally(() => prisma.$disconnect());
