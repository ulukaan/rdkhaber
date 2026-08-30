-- Article: KONUMLAR (vitrin bayrakları ve konuma özel görseller)
ALTER TABLE "Article" ADD COLUMN "inSpotlight" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Article" ADD COLUMN "inFiveHeadline" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Article" ADD COLUMN "imageMainHeadline" TEXT;
ALTER TABLE "Article" ADD COLUMN "imageTopHeadline" TEXT;
ALTER TABLE "Article" ADD COLUMN "imageSpotlight" TEXT;
ALTER TABLE "Article" ADD COLUMN "imageFiveHeadline" TEXT;
ALTER TABLE "Article" ADD COLUMN "imageSocial" TEXT;
ALTER TABLE "Article" ADD COLUMN "imageStory" TEXT;

-- Article: ek ayarlar
ALTER TABLE "Article" ADD COLUMN "videoEmbed" TEXT;
ALTER TABLE "Article" ADD COLUMN "redirectUrl" TEXT;
ALTER TABLE "Article" ADD COLUMN "sourceName" TEXT;
ALTER TABLE "Article" ADD COLUMN "sourceUrl" TEXT;
ALTER TABLE "Article" ADD COLUMN "reporterName" TEXT;

-- Article: SEO meta
ALTER TABLE "Article" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "Article" ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "Article" ADD COLUMN "seoKeywords" TEXT;

-- AdSlot: şemadaki @@unique([position]) daha önce migration'a girmemişti
CREATE UNIQUE INDEX IF NOT EXISTS "AdSlot_position_key" ON "AdSlot"("position");
