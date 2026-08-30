import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`MailboxMessage\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`direction\` VARCHAR(191) NOT NULL,
      \`externalId\` VARCHAR(191) NULL,
      \`fromAddress\` VARCHAR(191) NOT NULL,
      \`toAddress\` VARCHAR(191) NOT NULL,
      \`subject\` VARCHAR(191) NOT NULL,
      \`bodyHtml\` LONGTEXT NULL,
      \`bodyText\` LONGTEXT NULL,
      \`isRead\` BOOLEAN NOT NULL DEFAULT false,
      \`source\` VARCHAR(191) NOT NULL DEFAULT 'imap',
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      INDEX \`MailboxMessage_direction_createdAt_idx\`(\`direction\`, \`createdAt\`),
      UNIQUE INDEX \`MailboxMessage_direction_externalId_key\`(\`direction\`, \`externalId\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  console.log("MailboxMessage table ready");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
