/**
 * Seçim veri motoru tabloları — idempotent (Hostinger deploy).
 */
import { PrismaClient } from "@prisma/client";
import { hasDatabaseUrl, skipMessage } from "./ensure-db-utils.mjs";

const prisma = new PrismaClient();

async function tableExists(table) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    table,
  );
  return Number(rows[0]?.c ?? 0) > 0;
}

async function columnExists(table, column) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    table,
    column,
  );
  return Number(rows[0]?.c ?? 0) > 0;
}

async function exec(sql) {
  try {
    await prisma.$executeRawUnsafe(sql);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/Duplicate|already exists|errno: 1060|errno: 1061|errno: 1826/i.test(message)) return;
    throw error;
  }
}

async function ensureColumn(table, column, ddl) {
  if (!(await columnExists(table, column))) {
    await exec(ddl);
  }
}

async function main() {
  if (!hasDatabaseUrl()) {
    skipMessage("ensure-election-engine-tables");
    return;
  }

  await exec(`
    CREATE TABLE IF NOT EXISTS \`Party\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`slug\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`shortName\` VARCHAR(191) NULL,
      \`color\` VARCHAR(191) NOT NULL DEFAULT '#b9c5d1',
      \`logoUrl\` VARCHAR(191) NULL,
      \`active\` BOOLEAN NOT NULL DEFAULT true,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL,
      UNIQUE INDEX \`Party_slug_key\`(\`slug\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await ensureColumn("ElectionCandidate", "primaryPartyId", "ALTER TABLE `ElectionCandidate` ADD COLUMN `primaryPartyId` VARCHAR(191) NULL");

  await exec(`
    CREATE TABLE IF NOT EXISTS \`CandidatePartySupport\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`candidateId\` VARCHAR(191) NOT NULL,
      \`partyId\` VARCHAR(191) NOT NULL,
      \`role\` ENUM('NOMINATING', 'SUPPORTING', 'COALITION', 'INDEPENDENT') NOT NULL DEFAULT 'NOMINATING',
      \`validFrom\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`validTo\` DATETIME(3) NULL,
      UNIQUE INDEX \`CandidatePartySupport_candidateId_partyId_role_key\`(\`candidateId\`, \`partyId\`, \`role\`),
      INDEX \`CandidatePartySupport_partyId_idx\`(\`partyId\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS \`ElectionRound\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`electionId\` VARCHAR(191) NOT NULL,
      \`roundNumber\` INTEGER NOT NULL DEFAULT 1,
      \`name\` VARCHAR(191) NULL,
      \`electionDate\` DATETIME(3) NULL,
      \`status\` ENUM('SCHEDULED', 'VOTING', 'COUNTING', 'PROVISIONAL', 'UPDATED', 'FINAL', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL,
      UNIQUE INDEX \`ElectionRound_electionId_roundNumber_key\`(\`electionId\`, \`roundNumber\`),
      INDEX \`ElectionRound_electionId_idx\`(\`electionId\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS \`DataSource\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`kind\` ENUM('YSK_API', 'YSK_CSV', 'MANUAL', 'PARTNER_FEED', 'SCRAPER') NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`baseUrl\` VARCHAR(191) NULL,
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS \`ResultImport\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`sourceId\` VARCHAR(191) NOT NULL,
      \`electionId\` VARCHAR(191) NOT NULL,
      \`sourceUrl\` TEXT NULL,
      \`importedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`importedBy\` VARCHAR(191) NULL,
      \`verified\` BOOLEAN NOT NULL DEFAULT false,
      \`verifiedAt\` DATETIME(3) NULL,
      \`verifiedBy\` VARCHAR(191) NULL,
      \`note\` TEXT NULL,
      INDEX \`ResultImport_electionId_importedAt_idx\`(\`electionId\`, \`importedAt\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS \`ResultSnapshot\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`electionId\` VARCHAR(191) NOT NULL,
      \`roundId\` VARCHAR(191) NULL,
      \`importId\` VARCHAR(191) NULL,
      \`kind\` ENUM('PROVISIONAL', 'UPDATED', 'FINAL') NOT NULL,
      \`label\` VARCHAR(191) NULL,
      \`publishedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`isActive\` BOOLEAN NOT NULL DEFAULT false,
      \`totals\` JSON NULL,
      INDEX \`ResultSnapshot_electionId_kind_publishedAt_idx\`(\`electionId\`, \`kind\`, \`publishedAt\`),
      INDEX \`ResultSnapshot_roundId_idx\`(\`roundId\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS \`ElectionPeriod\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`slug\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`year\` INTEGER NOT NULL,
      \`startsAt\` DATETIME(3) NULL,
      \`endsAt\` DATETIME(3) NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL,
      UNIQUE INDEX \`ElectionPeriod_slug_key\`(\`slug\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS \`Person\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`fullName\` VARCHAR(191) NOT NULL,
      \`slug\` VARCHAR(191) NULL,
      \`photoUrl\` VARCHAR(191) NULL,
      \`bio\` TEXT NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL,
      UNIQUE INDEX \`Person_slug_key\`(\`slug\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS \`ElectionRuleSet\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`system\` ENUM('PLURALITY', 'TWO_ROUND_RUNOFF', 'DHONDT', 'QUOTA', 'REFERENDUM_MAJORITY') NOT NULL,
      \`runoffThreshold\` DOUBLE NULL,
      \`nationalBarrier\` DOUBLE NULL,
      \`districtBarrier\` DOUBLE NULL,
      \`seatCount\` INTEGER NULL,
      \`quotaFormula\` VARCHAR(191) NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL,
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS \`Alliance\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`slug\` VARCHAR(191) NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL,
      UNIQUE INDEX \`Alliance_slug_key\`(\`slug\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  for (const [col, ddl] of [
    ["periodId", "ALTER TABLE `Election` ADD COLUMN `periodId` VARCHAR(191) NULL"],
    ["scope", "ALTER TABLE `Election` ADD COLUMN `scope` ENUM('LOCAL', 'GENERAL', 'PRESIDENTIAL', 'REFERENDUM') NOT NULL DEFAULT 'LOCAL'"],
    ["provinceSlug", "ALTER TABLE `Election` ADD COLUMN `provinceSlug` VARCHAR(191) NULL"],
    ["provincePlateId", "ALTER TABLE `Election` ADD COLUMN `provincePlateId` INTEGER NULL"],
  ]) {
    await ensureColumn("Election", col, ddl);
  }

  await ensureColumn("ElectionRound", "ruleSetId", "ALTER TABLE `ElectionRound` ADD COLUMN `ruleSetId` VARCHAR(191) NULL");
  await ensureColumn("ElectionCandidate", "personId", "ALTER TABLE `ElectionCandidate` ADD COLUMN `personId` VARCHAR(191) NULL");

  await exec(`
    CREATE TABLE IF NOT EXISTS \`ElectionAlliance\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`roundId\` VARCHAR(191) NOT NULL,
      \`allianceId\` VARCHAR(191) NULL,
      \`displayName\` VARCHAR(191) NOT NULL,
      \`color\` VARCHAR(191) NULL,
      \`dissolvedAt\` DATETIME(3) NULL,
      \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`updatedAt\` DATETIME(3) NOT NULL,
      INDEX \`ElectionAlliance_roundId_idx\`(\`roundId\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS \`ElectionAllianceMember\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`allianceId\` VARCHAR(191) NOT NULL,
      \`partyId\` VARCHAR(191) NOT NULL,
      \`joinedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      \`leftAt\` DATETIME(3) NULL,
      UNIQUE INDEX \`ElectionAllianceMember_allianceId_partyId_key\`(\`allianceId\`, \`partyId\`),
      INDEX \`ElectionAllianceMember_partyId_idx\`(\`partyId\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS \`GeoUnit\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`roundId\` VARCHAR(191) NOT NULL,
      \`parentId\` VARCHAR(191) NULL,
      \`districtId\` VARCHAR(191) NULL,
      \`level\` ENUM('PROVINCE', 'DISTRICT') NOT NULL,
      \`name\` VARCHAR(191) NOT NULL,
      \`slug\` VARCHAR(191) NOT NULL,
      \`plateId\` INTEGER NULL,
      \`order\` INTEGER NOT NULL DEFAULT 0,
      \`totalBoxes\` INTEGER NOT NULL DEFAULT 0,
      \`openBoxes\` INTEGER NOT NULL DEFAULT 0,
      \`turnoutPct\` DOUBLE NOT NULL DEFAULT 0,
      UNIQUE INDEX \`GeoUnit_districtId_key\`(\`districtId\`),
      UNIQUE INDEX \`GeoUnit_roundId_slug_level_key\`(\`roundId\`, \`slug\`, \`level\`),
      INDEX \`GeoUnit_roundId_parentId_idx\`(\`roundId\`, \`parentId\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS \`PollingStation\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`geoUnitId\` VARCHAR(191) NOT NULL,
      \`boxNumber\` INTEGER NOT NULL,
      \`externalCode\` VARCHAR(191) NULL,
      \`totalVoters\` INTEGER NOT NULL DEFAULT 0,
      UNIQUE INDEX \`PollingStation_geoUnitId_boxNumber_key\`(\`geoUnitId\`, \`boxNumber\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS \`VoteResult\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`snapshotId\` VARCHAR(191) NOT NULL,
      \`candidateId\` VARCHAR(191) NOT NULL,
      \`geoUnitId\` VARCHAR(191) NULL,
      \`stationId\` VARCHAR(191) NULL,
      \`votes\` INTEGER NOT NULL DEFAULT 0,
      \`votePct\` DOUBLE NOT NULL DEFAULT 0,
      INDEX \`VoteResult_snapshotId_candidateId_idx\`(\`snapshotId\`, \`candidateId\`),
      INDEX \`VoteResult_snapshotId_geoUnitId_idx\`(\`snapshotId\`, \`geoUnitId\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  await exec(`
    CREATE TABLE IF NOT EXISTS \`SeatAllocation\` (
      \`id\` VARCHAR(191) NOT NULL,
      \`snapshotId\` VARCHAR(191) NOT NULL,
      \`ruleSetId\` VARCHAR(191) NULL,
      \`partyId\` VARCHAR(191) NULL,
      \`allianceId\` VARCHAR(191) NULL,
      \`geoUnitId\` VARCHAR(191) NULL,
      \`seats\` INTEGER NOT NULL,
      \`method\` ENUM('PLURALITY', 'TWO_ROUND_RUNOFF', 'DHONDT', 'QUOTA', 'REFERENDUM_MAJORITY') NOT NULL,
      \`detail\` JSON NULL,
      INDEX \`SeatAllocation_snapshotId_idx\`(\`snapshotId\`),
      PRIMARY KEY (\`id\`)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);

  if (await tableExists("ResultSnapshot")) {
    await exec("CREATE INDEX `ResultSnapshot_electionId_isActive_idx` ON `ResultSnapshot`(`electionId`, `isActive`)");
  }

  console.log("ensure-election-engine-tables: OK");
}

main()
  .catch((err) => {
    console.error("ensure-election-engine-tables failed:", err?.message ?? err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
