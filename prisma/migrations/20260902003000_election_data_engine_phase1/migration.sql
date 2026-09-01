-- Faz 1: Party + CandidatePartySupport + tur / kaynak iskeleti

CREATE TABLE `Party` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `shortName` VARCHAR(191) NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#b9c5d1',
    `logoUrl` VARCHAR(191) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `Party_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ElectionCandidate` ADD COLUMN `primaryPartyId` VARCHAR(191) NULL;
CREATE INDEX `ElectionCandidate_primaryPartyId_idx` ON `ElectionCandidate`(`primaryPartyId`);

CREATE TABLE `CandidatePartySupport` (
    `id` VARCHAR(191) NOT NULL,
    `candidateId` VARCHAR(191) NOT NULL,
    `partyId` VARCHAR(191) NOT NULL,
    `role` ENUM('NOMINATING', 'SUPPORTING', 'COALITION', 'INDEPENDENT') NOT NULL DEFAULT 'NOMINATING',
    `validFrom` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `validTo` DATETIME(3) NULL,
    UNIQUE INDEX `CandidatePartySupport_candidateId_partyId_role_key`(`candidateId`, `partyId`, `role`),
    INDEX `CandidatePartySupport_partyId_idx`(`partyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ElectionRound` (
    `id` VARCHAR(191) NOT NULL,
    `electionId` VARCHAR(191) NOT NULL,
    `roundNumber` INTEGER NOT NULL DEFAULT 1,
    `name` VARCHAR(191) NULL,
    `electionDate` DATETIME(3) NULL,
    `status` ENUM('SCHEDULED', 'VOTING', 'COUNTING', 'PROVISIONAL', 'UPDATED', 'FINAL', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    UNIQUE INDEX `ElectionRound_electionId_roundNumber_key`(`electionId`, `roundNumber`),
    INDEX `ElectionRound_electionId_idx`(`electionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `DataSource` (
    `id` VARCHAR(191) NOT NULL,
    `kind` ENUM('YSK_API', 'YSK_CSV', 'MANUAL', 'PARTNER_FEED', 'SCRAPER') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `baseUrl` VARCHAR(191) NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ResultImport` (
    `id` VARCHAR(191) NOT NULL,
    `sourceId` VARCHAR(191) NOT NULL,
    `electionId` VARCHAR(191) NOT NULL,
    `sourceUrl` TEXT NULL,
    `importedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `importedBy` VARCHAR(191) NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `verifiedAt` DATETIME(3) NULL,
    `verifiedBy` VARCHAR(191) NULL,
    `note` TEXT NULL,
    INDEX `ResultImport_electionId_importedAt_idx`(`electionId`, `importedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ResultSnapshot` (
    `id` VARCHAR(191) NOT NULL,
    `electionId` VARCHAR(191) NOT NULL,
    `roundId` VARCHAR(191) NULL,
    `importId` VARCHAR(191) NULL,
    `kind` ENUM('PROVISIONAL', 'UPDATED', 'FINAL') NOT NULL,
    `label` VARCHAR(191) NULL,
    `publishedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `totals` JSON NULL,
    INDEX `ResultSnapshot_electionId_kind_publishedAt_idx`(`electionId`, `kind`, `publishedAt`),
    INDEX `ResultSnapshot_roundId_idx`(`roundId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ElectionCandidate` ADD CONSTRAINT `ElectionCandidate_primaryPartyId_fkey` FOREIGN KEY (`primaryPartyId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `CandidatePartySupport` ADD CONSTRAINT `CandidatePartySupport_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `ElectionCandidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CandidatePartySupport` ADD CONSTRAINT `CandidatePartySupport_partyId_fkey` FOREIGN KEY (`partyId`) REFERENCES `Party`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ElectionRound` ADD CONSTRAINT `ElectionRound_electionId_fkey` FOREIGN KEY (`electionId`) REFERENCES `Election`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ResultImport` ADD CONSTRAINT `ResultImport_sourceId_fkey` FOREIGN KEY (`sourceId`) REFERENCES `DataSource`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ResultImport` ADD CONSTRAINT `ResultImport_electionId_fkey` FOREIGN KEY (`electionId`) REFERENCES `Election`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ResultSnapshot` ADD CONSTRAINT `ResultSnapshot_electionId_fkey` FOREIGN KEY (`electionId`) REFERENCES `Election`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ResultSnapshot` ADD CONSTRAINT `ResultSnapshot_roundId_fkey` FOREIGN KEY (`roundId`) REFERENCES `ElectionRound`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `ResultSnapshot` ADD CONSTRAINT `ResultSnapshot_importId_fkey` FOREIGN KEY (`importId`) REFERENCES `ResultImport`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
