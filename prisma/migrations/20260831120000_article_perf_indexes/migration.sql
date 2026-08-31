-- Article list queries (featured, most-read)
CREATE INDEX `Article_status_isFeatured_publishedAt_idx` ON `Article`(`status`, `isFeatured`, `publishedAt`);
CREATE INDEX `Article_status_viewCount_idx` ON `Article`(`status`, `viewCount`);
