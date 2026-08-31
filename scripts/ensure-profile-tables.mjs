import { PrismaClient } from "@prisma/client";
import { hasDatabaseUrl, skipMessage } from "./ensure-db-utils.mjs";

const prisma = new PrismaClient();

async function main() {
  if (!hasDatabaseUrl()) {
    skipMessage("ensure-profile-tables");
    return;
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`ArticleBookmark\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`userId\` VARCHAR(191) NOT NULL,
      \`articleId\` VARCHAR(191) NOT NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      UNIQUE INDEX \`ArticleBookmark_userId_articleId_key\`(\`userId\`, \`articleId\`),
      INDEX \`ArticleBookmark_userId_createdAt_idx\`(\`userId\`, \`createdAt\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`ArticleRead\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`userId\` VARCHAR(191) NOT NULL,
      \`articleId\` VARCHAR(191) NOT NULL,
      \`readAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      UNIQUE INDEX \`ArticleRead_userId_articleId_key\`(\`userId\`, \`articleId\`),
      INDEX \`ArticleRead_userId_readAt_idx\`(\`userId\`, \`readAt\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`AuthorFollow\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`followerId\` VARCHAR(191) NOT NULL,
      \`authorId\` VARCHAR(191) NOT NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      UNIQUE INDEX \`AuthorFollow_followerId_authorId_key\`(\`followerId\`, \`authorId\`),
      INDEX \`AuthorFollow_followerId_createdAt_idx\`(\`followerId\`, \`createdAt\`),
      INDEX \`AuthorFollow_authorId_idx\`(\`authorId\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  console.log("Profile tables ready");
}

main()
  .catch((err) => {
    console.error("ensure-profile-tables skipped:", err?.message ?? err);
  })
  .finally(() => prisma.$disconnect());
