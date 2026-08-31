CREATE TABLE IF NOT EXISTS `ArticleCategory` (
    `articleId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`articleId`, `categoryId`)
);

CREATE INDEX `ArticleCategory_categoryId_idx` ON `ArticleCategory`(`categoryId`);

INSERT OR IGNORE INTO `ArticleCategory` (`articleId`, `categoryId`)
SELECT `id`, `categoryId` FROM `Article` WHERE `categoryId` IS NOT NULL AND `categoryId` <> '';
