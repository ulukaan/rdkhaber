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
    skipMessage("ensure-election-tables");
    return;
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`Election\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`slug\` VARCHAR(191) NOT NULL,
      \`title\` VARCHAR(191) NOT NULL,
      \`subtitle\` VARCHAR(191) NULL,
      \`electionDate\` DATETIME(3) NULL,
      \`status\` ENUM('DRAFT', 'UPCOMING', 'LIVE', 'FINISHED') NOT NULL DEFAULT 'DRAFT',
      \`showOnHome\` BOOLEAN NOT NULL DEFAULT false,
      \`isPrimary\` BOOLEAN NOT NULL DEFAULT false,
      \`liveRefreshSec\` INTEGER NOT NULL DEFAULT 60,
      \`totalBoxes\` INTEGER NOT NULL DEFAULT 0,
      \`openBoxes\` INTEGER NOT NULL DEFAULT 0,
      \`totalVoters\` INTEGER NOT NULL DEFAULT 0,
      \`usedVotes\` INTEGER NOT NULL DEFAULT 0,
      \`validVotes\` INTEGER NOT NULL DEFAULT 0,
      \`categorySlug\` VARCHAR(191) NULL,
      \`lastResultsAt\` DATETIME(3) NULL,
      \`yskSecimId\` INTEGER NULL,
      \`yskSecimTuru\` INTEGER NULL,
      \`yskIlId\` INTEGER NULL,
      \`yskFocusIlce\` VARCHAR(191) NULL,
      \`yskSyncEnabled\` BOOLEAN NOT NULL DEFAULT false,
      \`yskLastSyncAt\` DATETIME(3) NULL,
      \`yskLastSyncError\` TEXT NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL,
      UNIQUE INDEX \`Election_slug_key\`(\`slug\`),
      INDEX \`Election_status_isPrimary_idx\`(\`status\`, \`isPrimary\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`ElectionCandidate\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`electionId\` VARCHAR(191) NOT NULL,
      \`raceType\` ENUM('MAYOR', 'COUNCIL') NOT NULL DEFAULT 'MAYOR',
      \`name\` VARCHAR(191) NOT NULL,
      \`partyName\` VARCHAR(191) NOT NULL,
      \`partyColor\` VARCHAR(191) NOT NULL DEFAULT '#d0021b',
      \`photoUrl\` VARCHAR(191) NULL,
      \`slogan\` VARCHAR(191) NULL,
      \`bio\` TEXT NULL,
      \`votes\` INTEGER NOT NULL DEFAULT 0,
      \`votePct\` DOUBLE NOT NULL DEFAULT 0,
      \`prevVotes\` INTEGER NULL,
      \`prevVotePct\` DOUBLE NULL,
      \`order\` INTEGER NOT NULL DEFAULT 0,
      INDEX \`ElectionCandidate_electionId_raceType_order_idx\`(\`electionId\`, \`raceType\`, \`order\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`ElectionDistrict\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`electionId\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`slug\` VARCHAR(191) NOT NULL,
      \`order\` INTEGER NOT NULL DEFAULT 0,
      \`totalBoxes\` INTEGER NOT NULL DEFAULT 0,
      \`openBoxes\` INTEGER NOT NULL DEFAULT 0,
      \`turnoutPct\` DOUBLE NOT NULL DEFAULT 0,
      INDEX \`ElectionDistrict_electionId_order_idx\`(\`electionId\`, \`order\`),
      UNIQUE INDEX \`ElectionDistrict_electionId_slug_key\`(\`electionId\`, \`slug\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`ElectionDistrictResult\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`districtId\` VARCHAR(191) NOT NULL,
      \`candidateId\` VARCHAR(191) NOT NULL,
      \`votes\` INTEGER NOT NULL DEFAULT 0,
      \`votePct\` DOUBLE NOT NULL DEFAULT 0,
      INDEX \`ElectionDistrictResult_districtId_idx\`(\`districtId\`),
      UNIQUE INDEX \`ElectionDistrictResult_districtId_candidateId_key\`(\`districtId\`, \`candidateId\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  for (const [col, ddl] of [
    ["yskSecimId", "ALTER TABLE `Election` ADD COLUMN `yskSecimId` INTEGER NULL"],
    ["yskSecimTuru", "ALTER TABLE `Election` ADD COLUMN `yskSecimTuru` INTEGER NULL"],
    ["yskIlId", "ALTER TABLE `Election` ADD COLUMN `yskIlId` INTEGER NULL"],
    ["yskFocusIlce", "ALTER TABLE `Election` ADD COLUMN `yskFocusIlce` VARCHAR(191) NULL"],
    ["yskSyncEnabled", "ALTER TABLE `Election` ADD COLUMN `yskSyncEnabled` BOOLEAN NOT NULL DEFAULT false"],
    ["yskLastSyncAt", "ALTER TABLE `Election` ADD COLUMN `yskLastSyncAt` DATETIME(3) NULL"],
    ["yskLastSyncError", "ALTER TABLE `Election` ADD COLUMN `yskLastSyncError` TEXT NULL"],
  ]) {
    if (!(await columnExists("Election", col))) {
      await prisma.$executeRawUnsafe(ddl);
    }
  }
}

main()
  .catch((err) => {
    console.error("ensure-election-tables failed:", err?.message ?? err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
