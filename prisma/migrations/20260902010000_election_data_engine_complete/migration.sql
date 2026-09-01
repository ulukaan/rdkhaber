-- Faz 2-6: dönem, kişi, kurallar, ittifak, coğrafya, oy snapshot, sandalye

CREATE TABLE `ElectionPeriod` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `ElectionPeriod_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Person` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NULL,
    `photoUrl` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Person_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ElectionRuleSet` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `system` ENUM('PLURALITY', 'TWO_ROUND_RUNOFF', 'DHONDT', 'QUOTA', 'REFERENDUM_MAJORITY') NOT NULL,
    `runoffThreshold` DOUBLE NULL,
    `nationalBarrier` DOUBLE NULL,
    `districtBarrier` DOUBLE NULL,
    `seatCount` INTEGER NULL,
    `quotaFormula` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Alliance` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Alliance_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Election` ADD COLUMN `periodId` VARCHAR(191) NULL;
ALTER TABLE `Election` ADD COLUMN `scope` ENUM('LOCAL', 'GENERAL', 'PRESIDENTIAL', 'REFERENDUM') NOT NULL DEFAULT 'LOCAL';
ALTER TABLE `Election` ADD COLUMN `provinceSlug` VARCHAR(191) NULL;
ALTER TABLE `Election` ADD COLUMN `provincePlateId` INTEGER NULL;
CREATE INDEX `Election_scope_provinceSlug_idx` ON `Election`(`scope`, `provinceSlug`);

ALTER TABLE `ElectionRound` ADD COLUMN `ruleSetId` VARCHAR(191) NULL;
CREATE INDEX `ElectionRound_ruleSetId_idx` ON `ElectionRound`(`ruleSetId`);

ALTER TABLE `ElectionCandidate` ADD COLUMN `personId` VARCHAR(191) NULL;
CREATE INDEX `ElectionCandidate_personId_idx` ON `ElectionCandidate`(`personId`);

CREATE TABLE `ElectionAlliance` (
    `id` VARCHAR(191) NOT NULL,
    `roundId` VARCHAR(191) NOT NULL,
    `allianceId` VARCHAR(191) NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NULL,
    `dissolvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    INDEX `ElectionAlliance_roundId_idx`(`roundId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ElectionAllianceMember` (
    `id` VARCHAR(191) NOT NULL,
    `allianceId` VARCHAR(191) NOT NULL,
    `partyId` VARCHAR(191) NOT NULL,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `leftAt` DATETIME(3) NULL,
    UNIQUE INDEX `ElectionAllianceMember_allianceId_partyId_key`(`allianceId`, `partyId`),
    INDEX `ElectionAllianceMember_partyId_idx`(`partyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `GeoUnit` (
    `id` VARCHAR(191) NOT NULL,
    `roundId` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `districtId` VARCHAR(191) NULL,
    `level` ENUM('PROVINCE', 'DISTRICT') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `plateId` INTEGER NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `totalBoxes` INTEGER NOT NULL DEFAULT 0,
    `openBoxes` INTEGER NOT NULL DEFAULT 0,
    `turnoutPct` DOUBLE NOT NULL DEFAULT 0,
    UNIQUE INDEX `GeoUnit_districtId_key`(`districtId`),
    UNIQUE INDEX `GeoUnit_roundId_slug_level_key`(`roundId`, `slug`, `level`),
    INDEX `GeoUnit_roundId_parentId_idx`(`roundId`, `parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `PollingStation` (
    `id` VARCHAR(191) NOT NULL,
    `geoUnitId` VARCHAR(191) NOT NULL,
    `boxNumber` INTEGER NOT NULL,
    `externalCode` VARCHAR(191) NULL,
    `totalVoters` INTEGER NOT NULL DEFAULT 0,
    UNIQUE INDEX `PollingStation_geoUnitId_boxNumber_key`(`geoUnitId`, `boxNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `VoteResult` (
    `id` VARCHAR(191) NOT NULL,
    `snapshotId` VARCHAR(191) NOT NULL,
    `candidateId` VARCHAR(191) NOT NULL,
    `geoUnitId` VARCHAR(191) NULL,
    `stationId` VARCHAR(191) NULL,
    `votes` INTEGER NOT NULL DEFAULT 0,
    `votePct` DOUBLE NOT NULL DEFAULT 0,
    INDEX `VoteResult_snapshotId_candidateId_idx`(`snapshotId`, `candidateId`),
    INDEX `VoteResult_snapshotId_geoUnitId_idx`(`snapshotId`, `geoUnitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `SeatAllocation` (
    `id` VARCHAR(191) NOT NULL,
    `snapshotId` VARCHAR(191) NOT NULL,
    `ruleSetId` VARCHAR(191) NULL,
    `partyId` VARCHAR(191) NULL,
    `allianceId` VARCHAR(191) NULL,
    `geoUnitId` VARCHAR(191) NULL,
    `seats` INTEGER NOT NULL,
    `method` ENUM('PLURALITY', 'TWO_ROUND_RUNOFF', 'DHONDT', 'QUOTA', 'REFERENDUM_MAJORITY') NOT NULL,
    `detail` JSON NULL,
    INDEX `SeatAllocation_snapshotId_idx`(`snapshotId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `ResultSnapshot_electionId_isActive_idx` ON `ResultSnapshot`(`electionId`, `isActive`);

ALTER TABLE `Election` ADD CONSTRAINT `Election_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `ElectionPeriod`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `ElectionRound` ADD CONSTRAINT `ElectionRound_ruleSetId_fkey` FOREIGN KEY (`ruleSetId`) REFERENCES `ElectionRuleSet`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `ElectionCandidate` ADD CONSTRAINT `ElectionCandidate_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `Person`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `ElectionAlliance` ADD CONSTRAINT `ElectionAlliance_roundId_fkey` FOREIGN KEY (`roundId`) REFERENCES `ElectionRound`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ElectionAlliance` ADD CONSTRAINT `ElectionAlliance_allianceId_fkey` FOREIGN KEY (`allianceId`) REFERENCES `Alliance`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `ElectionAllianceMember` ADD CONSTRAINT `ElectionAllianceMember_allianceId_fkey` FOREIGN KEY (`allianceId`) REFERENCES `ElectionAlliance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ElectionAllianceMember` ADD CONSTRAINT `ElectionAllianceMember_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `GeoUnit` ADD CONSTRAINT `GeoUnit_roundId_fkey` FOREIGN KEY (`roundId`) REFERENCES `ElectionRound`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `GeoUnit` ADD CONSTRAINT `GeoUnit_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `GeoUnit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `GeoUnit` ADD CONSTRAINT `GeoUnit_districtId_fkey` FOREIGN KEY (`districtId`) REFERENCES `ElectionDistrict`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `PollingStation` ADD CONSTRAINT `PollingStation_geoUnitId_fkey` FOREIGN KEY (`geoUnitId`) REFERENCES `GeoUnit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `VoteResult` ADD CONSTRAINT `VoteResult_snapshotId_fkey` FOREIGN KEY (`snapshotId`) REFERENCES `ResultSnapshot`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `VoteResult` ADD CONSTRAINT `VoteResult_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `ElectionCandidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `VoteResult` ADD CONSTRAINT `VoteResult_geoUnitId_fkey` FOREIGN KEY (`geoUnitId`) REFERENCES `GeoUnit`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `VoteResult` ADD CONSTRAINT `VoteResult_stationId_fkey` FOREIGN KEY (`stationId`) REFERENCES `PollingStation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `SeatAllocation` ADD CONSTRAINT `SeatAllocation_snapshotId_fkey` FOREIGN KEY (`snapshotId`) REFERENCES `ResultSnapshot`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SeatAllocation` ADD CONSTRAINT `SeatAllocation_ruleSetId_fkey` FOREIGN KEY (`ruleSetId`) REFERENCES `ElectionRuleSet`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `SeatAllocation` ADD CONSTRAINT `SeatAllocation_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `SeatAllocation` ADD CONSTRAINT `SeatAllocation_allianceId_fkey` FOREIGN KEY (`allianceId`) REFERENCES `ElectionAlliance`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
