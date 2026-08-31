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
    skipMessage("ensure-news-essentials");
    return;
  }

  for (const [col, ddl] of [
    ["scheduledAt", "ALTER TABLE `Article` ADD COLUMN `scheduledAt` DATETIME(3) NULL"],
    ["isLiveBlog", "ALTER TABLE `Article` ADD COLUMN `isLiveBlog` BOOLEAN NOT NULL DEFAULT false"],
    ["approvedById", "ALTER TABLE `Article` ADD COLUMN `approvedById` VARCHAR(191) NULL"],
    ["approvedAt", "ALTER TABLE `Article` ADD COLUMN `approvedAt` DATETIME(3) NULL"],
  ]) {
    if (!(await columnExists("Article", col))) {
      await prisma.$executeRawUnsafe(ddl);
    }
  }

  if (!(await columnExists("Article", "scheduledAt"))) {
    /* already handled */
  } else {
    await prisma.$executeRawUnsafe(
      "CREATE INDEX IF NOT EXISTS `Article_scheduledAt_idx` ON `Article`(`scheduledAt`)",
    ).catch(() => {});
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`LiveBlogUpdate\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`articleId\` VARCHAR(191) NOT NULL,
      \`userId\` VARCHAR(191) NOT NULL,
      \`title\` VARCHAR(191) NULL,
      \`body\` TEXT NOT NULL,
      \`pinned\` BOOLEAN NOT NULL DEFAULT false,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      INDEX \`LiveBlogUpdate_articleId_createdAt_idx\`(\`articleId\`, \`createdAt\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`ArticleCorrection\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`articleId\` VARCHAR(191) NOT NULL,
      \`userId\` VARCHAR(191) NULL,
      \`note\` TEXT NOT NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      INDEX \`ArticleCorrection_articleId_createdAt_idx\`(\`articleId\`, \`createdAt\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`ContentComplaint\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`email\` VARCHAR(191) NOT NULL,
      \`phone\` VARCHAR(191) NULL,
      \`articleUrl\` VARCHAR(191) NULL,
      \`message\` TEXT NOT NULL,
      \`status\` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`resolvedAt\` DATETIME(3) NULL,
      INDEX \`ContentComplaint_status_createdAt_idx\`(\`status\`, \`createdAt\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`PushSubscription\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`endpoint\` VARCHAR(500) NOT NULL,
      \`p256dh\` VARCHAR(191) NOT NULL,
      \`auth\` VARCHAR(191) NOT NULL,
      \`userId\` VARCHAR(191) NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      UNIQUE INDEX \`PushSubscription_endpoint_key\`(\`endpoint\`),
      INDEX \`PushSubscription_userId_idx\`(\`userId\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`ArticleCategory\` (
      \`articleId\` VARCHAR(191) NOT NULL,
      \`categoryId\` VARCHAR(191) NOT NULL,
      PRIMARY KEY (\`articleId\`, \`categoryId\`),
      INDEX \`ArticleCategory_categoryId_idx\`(\`categoryId\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await prisma.$executeRawUnsafe(`
    INSERT IGNORE INTO \`ArticleCategory\` (\`articleId\`, \`categoryId\`)
    SELECT \`id\`, \`categoryId\` FROM \`Article\` WHERE \`categoryId\` IS NOT NULL AND \`categoryId\` <> ''
  `).catch(() => {});

  console.log("News essentials tables ready");
}

main()
  .catch((err) => {
    console.error("ensure-news-essentials skipped:", err?.message ?? err);
  })
  .finally(() => prisma.$disconnect());
