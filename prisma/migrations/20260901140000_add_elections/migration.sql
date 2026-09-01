-- CreateTable
CREATE TABLE `Election` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `subtitle` VARCHAR(191) NULL,
    `electionDate` DATETIME(3) NULL,
    `status` ENUM('DRAFT', 'UPCOMING', 'LIVE', 'FINISHED') NOT NULL DEFAULT 'DRAFT',
    `showOnHome` BOOLEAN NOT NULL DEFAULT false,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `liveRefreshSec` INTEGER NOT NULL DEFAULT 60,
    `totalBoxes` INTEGER NOT NULL DEFAULT 0,
    `openBoxes` INTEGER NOT NULL DEFAULT 0,
    `totalVoters` INTEGER NOT NULL DEFAULT 0,
    `usedVotes` INTEGER NOT NULL DEFAULT 0,
    `validVotes` INTEGER NOT NULL DEFAULT 0,
    `categorySlug` VARCHAR(191) NULL,
    `lastResultsAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Election_slug_key`(`slug`),
    INDEX `Election_status_isPrimary_idx`(`status`, `isPrimary`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ElectionCandidate` (
    `id` VARCHAR(191) NOT NULL,
    `electionId` VARCHAR(191) NOT NULL,
    `raceType` ENUM('MAYOR', 'COUNCIL') NOT NULL DEFAULT 'MAYOR',
    `name` VARCHAR(191) NOT NULL,
    `partyName` VARCHAR(191) NOT NULL,
    `partyColor` VARCHAR(191) NOT NULL DEFAULT '#d0021b',
    `photoUrl` VARCHAR(191) NULL,
    `slogan` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `votes` INTEGER NOT NULL DEFAULT 0,
    `votePct` DOUBLE NOT NULL DEFAULT 0,
    `prevVotes` INTEGER NULL,
    `prevVotePct` DOUBLE NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `ElectionCandidate_electionId_raceType_order_idx`(`electionId`, `raceType`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ElectionDistrict` (
    `id` VARCHAR(191) NOT NULL,
    `electionId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `totalBoxes` INTEGER NOT NULL DEFAULT 0,
    `openBoxes` INTEGER NOT NULL DEFAULT 0,
    `turnoutPct` DOUBLE NOT NULL DEFAULT 0,

    INDEX `ElectionDistrict_electionId_order_idx`(`electionId`, `order`),
    UNIQUE INDEX `ElectionDistrict_electionId_slug_key`(`electionId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ElectionDistrictResult` (
    `id` VARCHAR(191) NOT NULL,
    `districtId` VARCHAR(191) NOT NULL,
    `candidateId` VARCHAR(191) NOT NULL,
    `votes` INTEGER NOT NULL DEFAULT 0,
    `votePct` DOUBLE NOT NULL DEFAULT 0,

    INDEX `ElectionDistrictResult_districtId_idx`(`districtId`),
    UNIQUE INDEX `ElectionDistrictResult_districtId_candidateId_key`(`districtId`, `candidateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ElectionCandidate` ADD CONSTRAINT `ElectionCandidate_electionId_fkey` FOREIGN KEY (`electionId`) REFERENCES `Election`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ElectionDistrict` ADD CONSTRAINT `ElectionDistrict_electionId_fkey` FOREIGN KEY (`electionId`) REFERENCES `Election`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ElectionDistrictResult` ADD CONSTRAINT `ElectionDistrictResult_districtId_fkey` FOREIGN KEY (`districtId`) REFERENCES `ElectionDistrict`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ElectionDistrictResult` ADD CONSTRAINT `ElectionDistrictResult_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `ElectionCandidate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
