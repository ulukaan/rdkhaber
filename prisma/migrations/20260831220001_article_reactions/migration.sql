CREATE TABLE IF NOT EXISTS `ArticleReaction` (
    `id` VARCHAR(191) NOT NULL,
    `articleId` VARCHAR(191) NOT NULL,
    `visitorId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(32) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
);

CREATE UNIQUE INDEX `ArticleReaction_articleId_visitorId_key` ON `ArticleReaction`(`articleId`, `visitorId`);
CREATE INDEX `ArticleReaction_articleId_type_idx` ON `ArticleReaction`(`articleId`, `type`);
