-- CreateTable
CREATE TABLE `Company` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `logoUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `websiteUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `category` VARCHAR(191) NOT NULL DEFAULT '',
    `phone` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Company_slug_key`(`slug`),
    INDEX `Company_active_order_idx`(`active`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
