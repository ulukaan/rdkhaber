-- AlterTable
ALTER TABLE `Media` ADD COLUMN `contentHash` VARCHAR(64) NULL;

-- CreateIndex
CREATE INDEX `Media_contentHash_idx` ON `Media`(`contentHash`);
